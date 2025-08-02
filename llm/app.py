from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from utils import add_ticket_in_json,load_vector_store_and_fetch_similar_tickets
app =FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or set specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TicketReq(BaseModel):
    ticket:str

class TicketId(BaseModel):
    id:str

@app.post("/load")
async def get_similar_tickets(req:TicketReq):
    return load_vector_store_and_fetch_similar_tickets(query=req.ticket)

@app.post("/add")
async def add_ticket(req:TicketId):
    return add_ticket(req.id)
    