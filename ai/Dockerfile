FROM python:3.12.8

WORKDIR /app

COPY ./requirements.txt /ai/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /ai/requirements.txt

COPY . /app

EXPOSE 8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]