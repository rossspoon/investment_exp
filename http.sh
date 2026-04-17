#! /bin/bash

#python3 -m http.server 8889

export DATABASE_URL=postgres://rossspoon:@localhost:5432/rossspoon
echo $DATABASE_URL
php -S localhost:8889

