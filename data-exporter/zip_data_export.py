import logging
import os
import zipfile

import boto3
import requests
import sentry_sdk

sentry_sdk.init(
    dsn="https://29117c3e2c6f4528996c48aa73f83ed8@o1244295.ingest.us.sentry.io/4508291951362048",
    traces_sample_rate=0.0,
    profiles_sample_rate=0.0,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

s3 = boto3.client("s3")
EXPORTS_DIR = "exports"
BUCKET_NAME = os.environ["BUCKET_NAME"]
EXPORT_ID = os.environ["EXPORT_ID"]
EXPORTS_DIR = f"{EXPORTS_DIR}/{EXPORT_ID}"
ZIP_FILENAME = "/tmp/export.zip"
CALLBACK_URL = os.environ["CALLBACK_URL"]
# fallback if UPLOAD_NAME is not set (e.g. deploying new while other exports are triggered)
UPLOAD_PATH = f"{EXPORTS_DIR}/{os.environ['UPLOAD_NAME'] or EXPORT_ID}.zip"


def list_s3_files(prefix):
    logger.info(f"Listing S3 files with prefix: {prefix}")
    objects = []
    paginator = s3.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=BUCKET_NAME, Prefix=prefix):
        for obj in page.get("Contents", []):
            objects.append(obj["Key"])
    logger.info(f"Found {len(objects)} files to process")
    return objects


def download_file(key):
    logger.info(f"Downloading file: {key}")
    file_path = f"/tmp/{key.replace(EXPORTS_DIR + '/', '')}"
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    s3.download_file(BUCKET_NAME, key, file_path)
    logger.info(f"Successfully downloaded to: {file_path}")
    return file_path


def upload_zip_file():
    logger.info(f"Uploading zip file to S3: {UPLOAD_PATH}")
    with open(ZIP_FILENAME, "rb") as f:
        s3.upload_fileobj(f, BUCKET_NAME, UPLOAD_PATH)
    logger.info("Successfully uploaded zip file")
    return UPLOAD_PATH


def send_callback(zip_path):
    logger.info(f"Sending callback to: {CALLBACK_URL}")
    try:
        response = requests.put(CALLBACK_URL, json={"zip_path": zip_path})
        response.raise_for_status()
        logger.info("Successfully sent callback")
    except Exception as e:
        logger.error(f"Error sending callback: {str(e)}")
        raise


def main():
    logger.info(f"Starting export process for directory: {EXPORTS_DIR}")

    logger.info("Creating zip file")
    with zipfile.ZipFile(ZIP_FILENAME, "w") as zipf:
        for s3_key in list_s3_files(EXPORTS_DIR):
            try:
                local_file_path = download_file(s3_key)
                relative_path = local_file_path.replace("/tmp/", "")
                zipf.write(local_file_path, arcname=relative_path)
                os.remove(local_file_path)
                logger.info(f"Added {s3_key} to zip and cleaned up local file")
            except Exception as e:
                logger.error(f"Error processing file {s3_key}: {str(e)}")
                raise

    logger.info("Cleaning up original files from S3")
    for s3_key in list_s3_files(EXPORTS_DIR):
        try:
            s3.delete_object(Bucket=BUCKET_NAME, Key=s3_key)
            logger.info(f"Deleted S3 file: {s3_key}")
        except Exception as e:
            logger.error(f"Error deleting file {s3_key}: {str(e)}")
            raise

    zip_path = upload_zip_file()
    send_callback(zip_path)
    logger.info("Export process completed successfully")


if __name__ == "__main__":
    main()
