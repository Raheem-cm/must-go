# Tunatumia Node.js version 20
FROM node:20-slim

# Sakinisha vikorokoro vya lazima kwa ajili ya image processing na pupetter
RUN apt-get update && apt-get install -y \
    git \
    ffmpeg \
    imagemagick \
    webp && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Tengeneza folder la kazi ndani ya server
WORKDIR /root/DRAGON-XR

# Copy package.json kwanza ili kusakinisha libraries
COPY package.json .

# Sakinisha dependencies zote
RUN npm install

# Copy mafaili mengine yote ya bot
COPY . .

# Amri ya kuwasha bot
CMD ["npm", "start"]
