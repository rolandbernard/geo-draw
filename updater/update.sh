
dir_name=$(dirname $(realpath $0))

echo "===== GIT PULL =================================="

cd ${dir_name}/.. && \
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
        npx yarn install  && \
        npx yarn ghpages
fi

