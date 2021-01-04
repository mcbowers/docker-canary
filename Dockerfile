FROM node:12-alpine

# Copy in all necessary files.
COPY index.js .
COPY build/node_modules node_modules/
COPY lib ./lib

# Expose the environment and ports
ENV NODE_ENV prod
EXPOSE 8065

# Run our app.
CMD ["node", "index.js"]