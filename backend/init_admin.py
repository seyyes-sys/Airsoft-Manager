"""
Script pour créer ou mettre à jour l'utilisateur admin
"""
import os
from database import engine, get_db
from models import User, Base
from auth import hash_password
from sqlalchemy.orm import Session

def init_admin():
    # Créer toutes les tables
    Base.metadata.create_all(bind=engine)
    
    # Récupérer les credentials depuis les variables d'environnement
    admin_username = os.getenv("ADMIN_USERNAME", "admin")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    
    # Créer une session
    db = next(get_db())
    
    try:
        # Vérifier si l'admin existe
        admin = db.query(User).filter(User.username == admin_username).first()
        
        if admin:
            print(f"ℹ️  L'utilisateur admin '{admin_username}' existe déjà")
            print(f"   Utilisez l'interface 'Mot de passe' dans le dashboard pour le changer")
        else:
            # Créer l'admin avec un mot de passe hashé simple
            hashed_pwd = hash_password(admin_password)
            admin = User(
                username=admin_username,
                hashed_password=hashed_pwd,
                is_admin=True
            )
            db.add(admin)
            db.commit()
            print(f"✅ Utilisateur admin '{admin_username}' créé avec succès")
            print(f"   Username: {admin_username}")
            print(f"   Password: {admin_password}")
            print(f"   ⚠️  Pensez à changer ce mot de passe après la première connexion !")
    except Exception as e:
        print(f"❌ Erreur: {e}")
        print(f"   Essayez de vous connecter avec: {admin_username} / {admin_password}")
    finally:
        db.close()

if __name__ == "__main__":
    init_admin()
