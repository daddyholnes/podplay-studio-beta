import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use a service account.
cred = credentials.Certificate('path/to/your/serviceAccountKey.json')

app = firebase_admin.initialize_app(cred)

db = firestore.client()

def create_collections():
    # This function will create the necessary collections
    # when executed.  However, since the collections are
    # created implicitly when data is added, this script
    # is not strictly necessary.  Leaving it here for
    # demonstration purposes.
    pass

if __name__ == '__main__':
    create_collections()
    print("Firestore collections created (if they didn't exist).")
