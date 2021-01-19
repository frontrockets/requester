_This is part of @datarockets infrastructure_

## Install

```
npm install @frontrockets/requester
```

## Usage

```jsx
import Requester from "@frontrockets/requester";

// Requester uses Axios under the hood, expect relevant to Axios config

const api = new Requester({
  baseURL: process.env.REACT_APP_API,
  withCredentials: true,
  injectHeaders: () => ({
    Authorization: `Bearer ${SessionToken.get()}`,
  }),
  transformResponse: (response) => response.data,
});

api.get("/some-url");
api.post("/some-url");
api.patch("/some-url");
api.delete("/some-url");
```
