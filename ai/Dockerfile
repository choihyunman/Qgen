FROM python:3.12.8

WORKDIR /ai

COPY ./requirements.txt /ai/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /ai/requirements.txt

COPY . /ai

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]