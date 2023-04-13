import {app} from "./settings";
import {runDb} from "./repositories/db/db";

const port = 5007 || process.env.PORT

//start app
const startApp = async () => {
    await runDb()
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
})
}

startApp()