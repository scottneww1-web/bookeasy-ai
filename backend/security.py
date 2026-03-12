# 🔒 SECURITY MIDDLEWARE - Military-Grade Protection for Blitz AI
from fastapi import Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime, timedelta
from collections import defaultdict
import re
import secrets
from typing import Dict, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================
# 1. RATE LIMITING - Prevent Brute Force & DDoS
# ============================================

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Advanced rate limiting to prevent abuse"""
    
    def __init__(self, app, calls: int = 100, period: int = 60):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.requests: Dict[str, List[datetime]] = defaultdict(list)
        self.blocked_ips: Dict[str, datetime] = {}
    
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        
        # Check if blocked
        if client_ip in self.blocked_ips:
            if datetime.now() < self.blocked_ips[client_ip]:
                logger.warning(f"🚫 Blocked IP: {client_ip}")
                raise HTTPException(status_code=429, detail="Too many requests. IP blocked.")
            else:
                del self.blocked_ips[client_ip]
        
        # Clean old requests
        cutoff = datetime.now() - timedelta(seconds=self.period)
        self.requests[client_ip] = [t for t in self.requests[client_ip] if t > cutoff]
        
        # Check limit
        if len(self.requests[client_ip]) >= self.calls:
            self.blocked_ips[client_ip] = datetime.now() + timedelta(minutes=10)
            logger.warning(f"⚠️ Rate limit exceeded: {client_ip}")
            raise HTTPException(status_code=429, detail="Rate limit exceeded.")
        
        self.requests[client_ip].append(datetime.now())
        response = await call_next(request)
        return response


# ============================================
# 2. INPUT SANITIZATION - Prevent Injection
# ============================================

class InputSanitizer:
    """Sanitize all inputs to prevent attacks"""
    
    DANGEROUS_PATTERNS = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'on\w+\s*=',
        r'\$where',
        r'\$ne',
        r'eval\(',
        r'exec\(',
        r'__import__',
        r'DROP\s+TABLE',
        r'DELETE\s+FROM',
    ]
    
    @staticmethod
    def sanitize_text(text: str, max_length: int = 10000) -> str:
        if not text:
            return ""
        
        text = text[:max_length]
        
        for pattern in InputSanitizer.DANGEROUS_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                logger.warning(f"🚨 Malicious pattern detected")
                raise HTTPException(status_code=400, detail="Invalid input")
        
        text = text.replace('\x00', '')
        text = text.replace('<', '&lt;').replace('>', '&gt;')
        return text
    
    @staticmethod
    def sanitize_ai_prompt(prompt: str) -> str:
        """Extra sanitization for AI prompts"""
        dangerous_ai = [
            r'ignore\s+(previous|above|all)\s+instructions',
            r'you\s+are\s+now',
            r'system\s*:',
            r'jailbreak',
            r'DAN\s+mode',
        ]
        
        for pattern in dangerous_ai:
            if re.search(pattern, prompt, re.IGNORECASE):
                logger.warning(f"🚨 Prompt injection attempt")
                prompt = re.sub(pattern, '[FILTERED]', prompt, flags=re.IGNORECASE)
        
        return prompt


# ============================================
# 3. SECURITY HEADERS
# ============================================

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none';"
        )
        
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response


# ============================================
# 4. COST PROTECTION
# ============================================

class CostProtection:
    """Prevent API cost exploitation"""
    
    def __init__(self):
        self.user_costs: Dict[str, float] = defaultdict(float)
        self.daily_limit = 5.0  # $5 per day per IP
        self.last_reset = datetime.now()
    
    def check_cost(self, client_ip: str, estimated_cost: float) -> bool:
        if datetime.now() - self.last_reset > timedelta(days=1):
            self.user_costs.clear()
            self.last_reset = datetime.now()
        
        if self.user_costs[client_ip] + estimated_cost > self.daily_limit:
            logger.warning(f"💰 Cost limit exceeded: {client_ip}")
            return False
        
        self.user_costs[client_ip] += estimated_cost
        return True
    
    def estimate_cost(self, prompt: str) -> float:
        tokens = len(prompt.split()) * 1.3
        return (tokens / 1000) * 0.04


# ============================================
# 5. MONGODB SECURITY
# ============================================

class MongoDBSecurity:
    """Prevent MongoDB injection"""
    
    @staticmethod
    def sanitize_query(query: dict) -> dict:
        sanitized = {}
        
        for key, value in query.items():
            if isinstance(key, str) and key.startswith('$'):
                logger.warning(f"🚨 MongoDB injection: {key}")
                continue
            
            if isinstance(value, dict):
                sanitized[key] = MongoDBSecurity.sanitize_query(value)
            else:
                sanitized[key] = value
        
        return sanitized


__all__ = [
    'RateLimitMiddleware',
    'InputSanitizer',
    'SecurityHeadersMiddleware',
    'CostProtection',
    'MongoDBSecurity'
]
