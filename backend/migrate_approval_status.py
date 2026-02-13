"""
Script de migration pour ajouter le système d'approbation des inscriptions

Ce script ajoute les colonnes nécessaires pour le nouveau processus d'inscription :
- approval_status : statut d'approbation (pending/approved/rejected)
- rejection_reason : motif de rejet si l'inscription est refusée

Exécuter ce script AVANT de redémarrer l'application après la mise à jour.
"""
import os
import sys
from sqlalchemy import create_engine, text

# Configuration de la base de données
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://airsoft:airsoft@localhost:5432/airsoft_db"
)

def migrate():
    """Exécute la migration"""
    print("=" * 60)
    print("🔄 Migration : Système d'approbation des inscriptions")
    print("=" * 60)
    
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Vérifier si la colonne approval_status existe déjà
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'registrations' 
            AND column_name = 'approval_status'
        """)
        result = conn.execute(check_query)
        
        if result.fetchone():
            print("✓ La colonne 'approval_status' existe déjà")
        else:
            print("➕ Ajout de la colonne 'approval_status'...")
            conn.execute(text("""
                ALTER TABLE registrations 
                ADD COLUMN approval_status VARCHAR(20) DEFAULT 'approved'
            """))
            conn.commit()
            print("✓ Colonne 'approval_status' ajoutée")
        
        # Vérifier si la colonne rejection_reason existe déjà
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'registrations' 
            AND column_name = 'rejection_reason'
        """)
        result = conn.execute(check_query)
        
        if result.fetchone():
            print("✓ La colonne 'rejection_reason' existe déjà")
        else:
            print("➕ Ajout de la colonne 'rejection_reason'...")
            conn.execute(text("""
                ALTER TABLE registrations 
                ADD COLUMN rejection_reason TEXT
            """))
            conn.commit()
            print("✓ Colonne 'rejection_reason' ajoutée")
        
        # Mettre toutes les inscriptions existantes comme "approved" 
        # (pour ne pas bloquer les inscriptions déjà faites)
        print("🔄 Mise à jour des inscriptions existantes en 'approved'...")
        conn.execute(text("""
            UPDATE registrations 
            SET approval_status = 'approved' 
            WHERE approval_status IS NULL OR approval_status = ''
        """))
        conn.commit()
        print("✓ Inscriptions existantes mises à jour")
    
    print("=" * 60)
    print("✅ Migration terminée avec succès !")
    print("=" * 60)
    print("")
    print("📋 Résumé des changements :")
    print("   - Nouvelle colonne 'approval_status' (pending/approved/rejected)")
    print("   - Nouvelle colonne 'rejection_reason' (motif de rejet)")
    print("   - Les inscriptions existantes sont marquées comme 'approved'")
    print("")
    print("🚀 Vous pouvez maintenant redémarrer l'application.")


if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"❌ Erreur lors de la migration : {e}")
        sys.exit(1)
