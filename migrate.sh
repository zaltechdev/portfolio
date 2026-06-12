#!/bin/bash

echo "Menghapus folder drizzle..."
rm -rf drizzle

echo "Menghapus local.db..."
rm -f local.db

echo "Menjalankan db:generate..."
bun run db:generate

echo "Menjalankan db:migrate..."
bun run db:migrate

echo "Selesai!"
