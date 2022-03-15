
dir_name=$(dirname $0)

mkdir -p ${dir_name}/data/south-tyrol
node ${dir_name}/update_south_tyrol.js && \
new="true"

mkdir -p ${dir_name}/data/italy
node ${dir_name}/update_italy.js && \
new="true"

mkdir -p ${dir_name}/data/world
node ${dir_name}/update_world.js && \
new="true"

# mkdir -p ${dir_name}/data/massentest
# node ${dir_name}/update_massentest.js && \
# new="true"

if [ $new ]
then
    cd ${dir_name}/.. && \
    git pull && \
    yarn ghpages
fi

