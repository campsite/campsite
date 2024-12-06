FROM --platform=linux/amd64 python:3.9-slim

WORKDIR /app
COPY . /app

RUN pip install -r requirements.txt

CMD ["python", "zip_data_export.py"]
