from pymongo import MongoClient
from langchain_core.documents import Document
from bson import ObjectId
from langchain_groq import ChatGroq
from langchain_community.vectorstores import FAISS
from pymongo import MongoClient
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
import json
import os




def add_ticket_in_json(ticket_id):
    client = MongoClient("mongodb://localhost/odoo")
    db = client["odoo"]
    tickets_collection = db["tickets"]
    categories_collection = db["categories"]

    print(" Connected to MongoDB!")
    existing_ids = set()
    existing_docs=[]
    if os.path.exists("all_ticket_docs.json"):
        with open("all_ticket_docs.json", "r") as f:
            existing_docs = json.load(f)
            existing_ids = {doc["metadata"]["ticket_id"] for doc in existing_docs}
    # Print one ticket
    if(ticket_id in existing_ids):
        return
    ticket = tickets_collection.find_one({"_id": ObjectId(ticket_id)})
    all_docs=existing_docs

    category_doc = categories_collection.find_one({"_id": ticket["category"]})
    cat_name = category_doc["name"] if category_doc else "Unknown"

    content = f"""Ticket #{ticket.get("ticketNumber", "")}
        Subject: {ticket.get("subject", "")}
        Description: {ticket.get("description", "")}
        Category: {cat_name}
        Priority: {ticket.get("priority", "")}
        Status: {ticket.get("status", "")}
        """
    doc = Document(
        page_content=content.strip(),
        metadata={
            "ticket_id": str(ticket["_id"]),
            "category": cat_name,
            "priority": ticket.get("priority", ""),
            "status": ticket.get("status", "")
        }
    )
    all_docs.append({
            "page_content": doc.page_content,
            "metadata": doc.metadata
        })
    
    with open("all_ticket_docs.json", "w") as f:
        json.dump(all_docs, f, indent=2, default=str)


    print("Saved LangChain Document to ticket_doc.json")



def load_vector_store_and_fetch_similar_tickets(query: str, top_k: int = 3, json_path="all_ticket_docs.json"):
    
    if not os.path.exists(json_path):
        return

    with open(json_path, "r") as f:
        raw_docs = json.load(f)
    docs = [Document(**d) for d in raw_docs]

    embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vector_store = FAISS.from_documents(docs, embedding)
    
    retriever = vector_store.as_retriever(search_type="similarity", k=top_k)
    results = retriever.invoke(query)

    
    return [
        {
            "ticket_id": doc.metadata.get("ticket_id", ""),

        }
        for doc in results
    ]



query = "wifi issue in building A"
results = load_vector_store_and_fetch_similar_tickets(query)

print(results)