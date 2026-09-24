from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from backend.db.session import get_db
from backend.db.models import Message

router = APIRouter()

class MessageBase(BaseModel):
    employeeName: str
    department: str
    text: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: int
    date: datetime
    isRead: bool
    reply: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("/", response_model=List[MessageResponse])
def get_messages(db: Session = Depends(get_db)):
    messages = db.query(Message).order_by(Message.date.desc()).all()
    # map to frontend expectations
    result = []
    for msg in messages:
        result.append({
            "id": msg.id,
            "employeeName": msg.employee_name,
            "department": msg.department,
            "text": msg.text,
            "date": msg.date,
            "isRead": msg.is_read,
            "reply": msg.reply
        })
    return result

@router.post("/", response_model=MessageResponse)
def create_message(msg_in: MessageCreate, db: Session = Depends(get_db)):
    db_msg = Message(
        employee_name=msg_in.employeeName,
        department=msg_in.department,
        text=msg_in.text
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return {
        "id": db_msg.id,
        "employeeName": db_msg.employee_name,
        "department": db_msg.department,
        "text": db_msg.text,
        "date": db_msg.date,
        "isRead": db_msg.is_read,
        "reply": db_msg.reply
    }

@router.put("/{msg_id}/read")
def mark_as_read(msg_id: int, db: Session = Depends(get_db)):
    db_msg = db.query(Message).filter(Message.id == msg_id).first()
    if not db_msg:
        raise HTTPException(status_code=404, detail="Message not found")
    db_msg.is_read = True
    db.commit()
    return {"status": "success"}

@router.delete("/{msg_id}")
def delete_message(msg_id: int, db: Session = Depends(get_db)):
    db_msg = db.query(Message).filter(Message.id == msg_id).first()
    if not db_msg:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(db_msg)
    db.commit()
    return {"status": "success"}

class ReplyCreate(BaseModel):
    replyText: str

@router.put("/{msg_id}/reply")
def reply_to_message(msg_id: int, reply_in: ReplyCreate, db: Session = Depends(get_db)):
    db_msg = db.query(Message).filter(Message.id == msg_id).first()
    if not db_msg:
        raise HTTPException(status_code=404, detail="Message not found")
    db_msg.reply = reply_in.replyText
    db.commit()
    return {"status": "success"}

@router.get("/employee/{employee_name}", response_model=List[MessageResponse])
def get_employee_replies(employee_name: str, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(
        Message.employee_name == employee_name,
        Message.reply.isnot(None)
    ).order_by(Message.date.desc()).all()
    result = []
    for msg in messages:
        result.append({
            "id": msg.id,
            "employeeName": msg.employee_name,
            "department": msg.department,
            "text": msg.text,
            "date": msg.date,
            "isRead": msg.is_read,
            "reply": msg.reply
        })
    return result

@router.get("/unread-count")
def get_unread_count(db: Session = Depends(get_db)):
    count = db.query(Message).filter(Message.is_read == False).count()
    return {"count": count}
