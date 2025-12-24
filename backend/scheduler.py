"""
Scheduler pour les tâches automatiques
Utilise APScheduler pour exécuter les rappels automatiques tous les jours
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
import asyncio
import logging

from database import SessionLocal
from models import Game, Registration
from email_service import send_reminder_email

# Configuration du logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Instance du scheduler
scheduler = AsyncIOScheduler()


async def send_automatic_reminders_job():
    """
    Job qui envoie les rappels automatiques pour les parties dans 2 jours
    Exécuté tous les jours à 9h00 par le scheduler
    """
    db = SessionLocal()
    try:
        # Date dans 2 jours
        target_date = date.today() + timedelta(days=2)
        
        logger.info(f"🔍 Recherche des parties du {target_date.strftime('%d/%m/%Y')}...")
        
        # Trouver les parties dans 2 jours qui n'ont pas encore reçu de rappel
        games = db.query(Game).filter(
            Game.date == target_date,
            Game.reminder_sent == False
        ).all()
        
        if not games:
            logger.info(f"✓ Aucune partie trouvée pour le {target_date.strftime('%d/%m/%Y')} nécessitant un rappel")
            return
        
        logger.info(f"📧 {len(games)} partie(s) trouvée(s), envoi des rappels...")
        
        for game in games:
            logger.info(f"📅 Traitement de la partie: {game.name} ({game.date.strftime('%d/%m/%Y')})")
            
            # Récupérer les inscriptions confirmées
            registrations = db.query(Registration).filter(
                Registration.game_id == game.id,
                Registration.confirmed == True
            ).all()
            
            if not registrations:
                logger.warning(f"⚠️  Aucune inscription confirmée pour cette partie")
                game.reminder_sent = True
                db.commit()
                continue
            
            sent_count = 0
            error_count = 0
            
            for reg in registrations:
                try:
                    await send_reminder_email(
                        email=reg.email,
                        first_name=reg.first_name,
                        game_date=game.date
                    )
                    sent_count += 1
                    logger.info(f"✓ Rappel envoyé à {reg.first_name} ({reg.email})")
                except Exception as e:
                    error_count += 1
                    logger.error(f"✗ Erreur pour {reg.email}: {e}")
            
            # Marquer le rappel comme envoyé
            game.reminder_sent = True
            db.commit()
            
            logger.info(f"📊 Résumé: {sent_count} envoyés, {error_count} erreurs")
            logger.info(f"✓ Partie marquée comme rappel envoyé")
        
        logger.info(f"✅ Traitement terminé!")
        
    except Exception as e:
        logger.error(f"❌ Erreur lors du traitement: {e}")
        db.rollback()
    finally:
        db.close()


def start_scheduler():
    """
    Démarre le scheduler avec les tâches planifiées
    """
    # Configurer le job pour s'exécuter tous les jours à 9h00
    scheduler.add_job(
        send_automatic_reminders_job,
        trigger=CronTrigger(hour=9, minute=0),  # Tous les jours à 9h00
        id='automatic_reminders',
        name='Envoi automatique des rappels',
        replace_existing=True
    )
    
    # Démarrer le scheduler
    scheduler.start()
    logger.info("✅ Scheduler démarré - Rappels automatiques configurés pour 9h00 chaque jour")
    
    # Afficher les jobs planifiés
    jobs = scheduler.get_jobs()
    for job in jobs:
        logger.info(f"📅 Job planifié: {job.name} - Prochaine exécution: {job.next_run_time}")


def stop_scheduler():
    """
    Arrête le scheduler proprement
    """
    if scheduler.running:
        scheduler.shutdown()
        logger.info("🛑 Scheduler arrêté")
