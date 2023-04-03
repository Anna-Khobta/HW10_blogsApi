import {app} from "./settings";
import {runDb} from "./repositories/db";

const port = process.env.PORT || 3004

//start app
const startApp = async () => {
    await runDb()
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
})
}

startApp()