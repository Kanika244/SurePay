from motor.motor_asyncio import AsyncIOMotorClient

Mongo_url = "mongodb://localhost:27017"
client = AsyncIOMotorClient(Mongo_url)

database = client["SurePay"]
tenants = database["tenants"]
users = database["users"]