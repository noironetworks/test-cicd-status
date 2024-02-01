# cicd-status
CICD Status

#run locally:
cd cicd_status/docs
docker run -it --rm -v "$PWD":/usr/src/app -p "4000:4000" starefossen/github-pages
