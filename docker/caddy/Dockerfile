FROM golang:1.22-alpine AS builder

# Installer les dépendances nécessaires
RUN apk add --no-cache git gcc musl-dev

# Installer xcaddy
RUN go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest

# Ajouter Go bin au PATH et construire Caddy 2.7.6 avec le plugin Cloudflare DNS
ENV PATH="${PATH}:/root/go/bin"
RUN xcaddy build v2.7.6 \
    --output /usr/bin/caddy \
    --with github.com/caddy-dns/cloudflare

# Image finale légère
FROM alpine:3.19

# Installer les certificats CA et mailcap (pour les types MIME)
RUN apk add --no-cache ca-certificates mailcap

# Copier le binaire Caddy compilé
COPY --from=builder /usr/bin/caddy /usr/bin/caddy

# Vérifier que Caddy fonctionne et afficher la version
RUN caddy version

# Créer les répertoires nécessaires
RUN mkdir -p /config/caddy /data/caddy /etc/caddy

# Exposer les ports
EXPOSE 80 443 2019

# Volumes pour la persistance
VOLUME ["/config", "/data"]

# Commande par défaut
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
