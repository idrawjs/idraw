
```sh
lerna add @idraw/types --scope=idraw  --dev
lerna add @idraw/util --scope=@idraw/core 
```

```sh
npm run build && lerna publish --force-publish
```