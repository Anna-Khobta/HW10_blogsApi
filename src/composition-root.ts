import "reflect-metadata";
import {PostsQueryRepository} from "./repositories/posts-query-repository";
import {PostsService} from "./domain/posts-service";
import {PostsDbRepository} from "./repositories/posts-db-repository";
import {PostsController} from "./routers/posts-controller";
import {Container} from "inversify";


// экспортируются тся в блоги пока что (в дальнейшем надо убрать) когда везде будут классы
const postsDbRepository = new PostsDbRepository()
export const postQueryRepository = new PostsQueryRepository()
export const postsService = new PostsService(postQueryRepository, postsDbRepository)
//export const postsController = new PostsController(postsService)


export const container = new Container();
container.bind<PostsController>(PostsController).to(PostsController);
container.bind<PostsService>(PostsService).to(PostsService);
container.bind<PostsQueryRepository>(PostsQueryRepository).to(PostsQueryRepository);
container.bind<PostsDbRepository>(PostsDbRepository).to(PostsDbRepository);