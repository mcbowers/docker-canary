FROM node:12-alpine

# Copy in all necessary files.
COPY index.js .
COPY build/node_modules node_modules/

# Expose the environment and ports
ENV NODE_ENV test
EXPOSE 8065

# Run our app.
CMD ["node", "index.js"]