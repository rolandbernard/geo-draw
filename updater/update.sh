
dir_name=$(dirname $0)

echo "===== GIT PULL =================================="

git pull

echo "===== SOUTH TYROL ==============================="

mkdir -p ${dir_name}/data/south-tyrol
if node ${dir_name}/update_south_tyrol.js
then
    echo "===== UPDATE ===================================="
    new="true"
else
    echo "===== NO UPDATE ================================="
fi

echo "===== ITALY ====================================="

mkdir -p ${dir_name}/data/italy
if node ${dir_name}/update_italy.js
then
    echo "===== UPDATE ===================================="
    new="true"
else
    echo "===== NO UPDATE ================================="
fi

echo "===== WORLD ====================================="

mkdir -p ${dir_name}/data/world
if node ${dir_name}/update_world.js
then
    echo "===== UPDATE ===================================="
    new="true"
else
    echo "===== NO UPDATE ================================="
fi

# echo "===== MASSENTEST =========================="

# mkdir -p ${dir_name}/data/massentest
# if node ${dir_name}/update_massentest.js
# then
#     echo "===== UPDATE =============================="
#     new="true"
# else
#     echo "===== NO UPDATE ==========================="
# fi

if [ $new ]
then
    echo "===== PUBLISH =================================="
    cd ${dir_name}/.. && \
        yarn install  && \
        yarn ghpages
fi

