import {Sort} from "mongodb";


export const getPagination = (query: any) => {
    let page: number = Number(query.pageNumber) || 1
    let limit: number = Number(query.pageSize) || 10
    let sortDirection: Sort = query.sortDirection === 'asc' ? 1 : -1
    let sortBy: string = query.sortBy || 'createdAt'
    // Calculate skip values based on the page and pageSize
    const skip: number = (page - 1) * limit

    let searchNameTerm: string = query.searchNameTerm || ''
    let searchLoginTerm: string = query.searchLoginTerm || ''
    let searchEmailTerm: string = query.searchEmailTerm || ''

    return {page, limit, sortDirection,  sortBy, skip, searchNameTerm, searchLoginTerm, searchEmailTerm }
}
