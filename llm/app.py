from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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


@app.post("/rec")
async def get_similar_tickets(TicketReq):
    