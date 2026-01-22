from motor.motor_asyncio import AsyncIOMotorClient # pyright: ignore[reportMissingImports] 

Mongo_url = "mongodb://localhost:27017"
client = AsyncIOMotorClient(Mongo_url)

database = client.get_database("SurePay")
users_collection = database.get_collection("users")
otp_collection = database.get_collection("otp")


individualusers= database.get_collection("individual_users")
individual_otp = database.get_collection("individual_otp")