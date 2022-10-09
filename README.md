<div align="center">
  <img alt="Logo" src="https://raw.githubusercontent.com/zomeru/stica-lms/main/apps/lms/public/assets/images/STI_LOGO.png" width="100" />
</div>

<h1 align="center">
  <a href="https://sticalms.com/" target="_blank">sticalms.com</a>
</h1>
<p align="center">
  This is our capstone project for my final year in STI College Alabang. It is built with <a href="https://vercel.com/" target="_blank">Vercel</a> technologies such as <a href="https://nextjs.org/" target="_blank">Next.js</a> and <a href="https://turborepo.org/" target="_blank">Turborepo</a>. Uses <a href="https://firebase.google.com/" target="_blank">Firebase</a> as database and hosted in <a href="https://vercel.com/" target="_blank">Vercel</a>.
</p>

<!-- ![demo](https://raw.githubusercontent.com/demo.png) -->

## 🛠 Installation & Set Up

1. Install and use the correct version of Node using [NVM](https://github.com/nvm-sh/nvm)

   ```sh
   nvm install
   ```

2. Install dependencies

   ```sh
   yarn
   ```

   or

   ```sh
   yarn install
   ```

3. Start the development server

- Start all apps

```sh
yarn dev
```

- Start lms

```sh
yarn dev:lms
```

- Start mobile lms

```sh
yarn dev:mobile
```

- Start admin

```sh
yarn dev:admin
```

## 🚀 Building and Running for Production

1. Generate a full static production build

   - Build all apps

   ```sh
   yarn build
   ```

   - Build lms

   ```sh
   yarn build:lms
   ```

   - Build mobile lms

   ```sh
   yarn build:mobile
   ```

   - Build admin

   ```sh
   yarn build:admin
   ```

1. Preview the site as it will appear once deployed

   - Preview all apps

   ```sh
   yarn start
   ```

   - Preview lms

   ```sh
   yarn start:lms
   ```

   - Preview mobile lms

   ```sh
   yarn start:mobile
   ```

   - Preview admin

   ```sh
   yarn start:admin
   ```
