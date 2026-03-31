"""Movement video server — stores, transcodes, and serves video files."""

import json
import shutil
import subprocess
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

STORAGE_ROOT = Path.home() / "movement-videos"
ORIGINALS_DIR = STORAGE_ROOT / "originals"
PROCESSED_DIR = STORAGE_ROOT / "processed"
THUMBNAILS_DIR = STORAGE_ROOT / "thumbnails"
PREVIEWS_DIR = STORAGE_ROOT / "previews"
DB_PATH = STORAGE_ROOT / "db.json"

VALID_ACTIVITIES = [
    "lindy-hop", "fusion", "gym", "swimming",
    "hiking", "acro-yoga", "rollerskating", "tennis",
]

ALLOWED_EXTENSIONS = {".mp4", ".mov", ".avi", ".webm", ".mkv", ".m4v"}

db_lock = threading.Lock()


def ensure_dirs():
    for d in [ORIGINALS_DIR, PROCESSED_DIR, THUMBNAILS_DIR, PREVIEWS_DIR]:
        d.mkdir(parents=True, exist_ok=True)


def load_db() -> dict:
    if DB_PATH.exists():
        return json.loads(DB_PATH.read_text())
    return {"videos": {}}


def save_db(data: dict):
    with db_lock:
        DB_PATH.write_text(json.dumps(data, indent=2))


def check_ffmpeg():
    if not shutil.which("ffmpeg"):
        raise SystemExit(
            "ffmpeg not found. Install it with: brew install ffmpeg"
        )
    if not shutil.which("ffprobe"):
        raise SystemExit(
            "ffprobe not found. Install it with: brew install ffmpeg"
        )


def get_duration(path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe", "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            str(path),
        ],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        return 0.0
    info = json.loads(result.stdout)
    return float(info.get("format", {}).get("duration", 0))


def transcode_video(video_id: str):
    db = load_db()
    entry = db["videos"].get(video_id)
    if not entry:
        return

    original = ORIGINALS_DIR / entry["original_stored"]
    output = PROCESSED_DIR / f"{video_id}.mp4"
    thumbnail = THUMBNAILS_DIR / f"{video_id}.jpg"

    try:
        # Transcode to web-friendly H.264
        subprocess.run(
            [
                "ffmpeg", "-y", "-i", str(original),
                "-c:v", "libx264", "-preset", "fast", "-crf", "23",
                "-c:a", "aac",
                "-movflags", "+faststart",
                "-vf", "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2",
                str(output),
            ],
            capture_output=True, check=True,
        )

        # Generate thumbnail
        subprocess.run(
            [
                "ffmpeg", "-y", "-i", str(output),
                "-ss", "00:00:01",
                "-vframes", "1",
                "-vf", "scale=480:-1",
                str(thumbnail),
            ],
            capture_output=True, check=True,
        )

        # Generate low-res preview clip for ambient autoplay
        preview = PREVIEWS_DIR / f"{video_id}_preview.mp4"
        subprocess.run(
            [
                "ffmpeg", "-y", "-i", str(output),
                "-ss", "00:00:01", "-t", "12",
                "-c:v", "libx264", "-preset", "fast", "-crf", "28",
                "-an",
                "-movflags", "+faststart",
                "-vf", "scale=480:-2",
                str(preview),
            ],
            capture_output=True, check=True,
        )

        duration = get_duration(output)

        db = load_db()
        db["videos"][video_id]["status"] = "ready"
        db["videos"][video_id]["duration_seconds"] = round(duration, 1)
        db["videos"][video_id]["filename"] = f"{video_id}.mp4"
        db["videos"][video_id]["thumbnail"] = f"{video_id}.jpg"
        db["videos"][video_id]["preview"] = f"{video_id}_preview.mp4"
        save_db(db)

    except subprocess.CalledProcessError:
        db = load_db()
        db["videos"][video_id]["status"] = "error"
        save_db(db)


# --- App setup ---

check_ffmpeg()
ensure_dirs()

app = FastAPI(title="Movement Video Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4000",
        "http://127.0.0.1:4000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/videos", StaticFiles(directory=str(PROCESSED_DIR)), name="videos")
app.mount("/thumbnails", StaticFiles(directory=str(THUMBNAILS_DIR)), name="thumbnails")
app.mount("/previews", StaticFiles(directory=str(PREVIEWS_DIR)), name="previews")


# --- Routes ---

@app.get("/", response_class=HTMLResponse)
def upload_page():
    html_path = Path(__file__).parent / "upload.html"
    return HTMLResponse(html_path.read_text())


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/videos")
def list_videos(activity: str | None = None):
    db = load_db()
    videos = list(db["videos"].values())
    if activity:
        videos = [v for v in videos if v["activity"] == activity]
    videos.sort(key=lambda v: v["created_at"], reverse=True)
    return {"videos": videos}


@app.get("/api/videos/{video_id}")
def get_video(video_id: str):
    db = load_db()
    entry = db["videos"].get(video_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Video not found")
    return entry


@app.post("/api/videos")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    activity: str = Form(...),
):
    if activity not in VALID_ACTIVITIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid activity. Must be one of: {', '.join(VALID_ACTIVITIES)}",
        )

    ext = Path(file.filename or "video.mp4").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}",
        )

    video_id = uuid.uuid4().hex[:12]
    stored_name = f"{video_id}{ext}"
    original_path = ORIGINALS_DIR / stored_name

    with open(original_path, "wb") as f:
        while chunk := await file.read(1024 * 1024):
            f.write(chunk)

    entry = {
        "id": video_id,
        "activity": activity,
        "original_name": file.filename,
        "original_stored": stored_name,
        "filename": None,
        "thumbnail": None,
        "preview": None,
        "duration_seconds": None,
        "status": "processing",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    db = load_db()
    db["videos"][video_id] = entry
    save_db(db)

    background_tasks.add_task(transcode_video, video_id)

    return entry


@app.delete("/api/videos/{video_id}")
def delete_video(video_id: str):
    db = load_db()
    entry = db["videos"].pop(video_id, None)
    if not entry:
        raise HTTPException(status_code=404, detail="Video not found")
    save_db(db)

    # Clean up files
    for path in [
        ORIGINALS_DIR / entry.get("original_stored", ""),
        PROCESSED_DIR / f"{video_id}.mp4",
        THUMBNAILS_DIR / f"{video_id}.jpg",
        PREVIEWS_DIR / f"{video_id}_preview.mp4",
    ]:
        if path.exists():
            path.unlink()

    return {"deleted": video_id}


if __name__ == "__main__":
    import uvicorn
    print(f"Video storage: {STORAGE_ROOT}")
    print(f"Upload UI:     http://localhost:5555")
    print(f"API docs:      http://localhost:5555/docs")
    uvicorn.run(app, host="0.0.0.0", port=5555)
