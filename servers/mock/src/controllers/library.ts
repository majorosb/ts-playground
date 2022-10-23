import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";
import type { FastifyPluginCallback } from "fastify";
import { TypeUtils } from "src/utils/utils-typebox";
import { makeController, registerController } from "src/utils/utils-controller";
import { useIdSource } from "src/utils/useIdSource";

const LibraryItemDto = Type.Object({
    id:             Type.Number(),
    type:           TypeUtils.StringUnion(["folder", "file"]),
    /** Doesn't exist or null for root level */
    parentId:       TypeUtils.ApiUntrusted(Type.Number()),
    name:           Type.String(),
    /** Only exists when type is "file" */
    documentId:     TypeUtils.ApiUntrusted(Type.Number()),
    /** File download link, may or may not be provided for a file */
    documentUrl:    TypeUtils.ApiUntrusted(Type.String()),
    /** May only exists when type is "file" */
    description:    TypeUtils.ApiUntrusted(Type.String()),
    creationTime:   TypeUtils.ApiUntrusted(Type.String({ description: `Date format is "yyyy.MM.dd"`, pattern: /^\d{4}\.\d{2}\.\d{2}$/.source, })),
    /** Navigation link, may or may not exist for a file */
    linkUrl:        TypeUtils.ApiUntrusted(Type.String()),
}, { $id: "LibraryItemDto", });
type LibraryItemDto = Static<typeof LibraryItemDto>;

const LibraryViewDto = Type.Object({
    items: Type.Array(Type.Ref(LibraryItemDto)),
    isUploadEnabled: TypeUtils.ApiUntrusted(Type.Boolean()),
}, { $id: "LibraryViewDto", });
type LibraryViewDto = Static<typeof LibraryViewDto>;

const RemoveLibraryItemsDto = Type.Object({
    removedItems: Type.Array(Type.Number()),
}, { $id: "RemoveLibraryItemsDto", });
type RemoveLibraryItemsDto = Static<typeof RemoveLibraryItemsDto>;

const LibraryViewQueryLocation = TypeUtils.StringUnion(["tender", "knowledgebase", "documents"], { $id: "LibraryViewQueryLocation", });
type LibraryViewQueryLocation = Static<typeof LibraryViewQueryLocation>;

export const plugin_controller_library: FastifyPluginCallback = (fastify, opts, done) => {
    registerController(fastify, controller_delivery, { prefix: "/library", });
    done();
};

const MOCK_LIBRARY_ITEMS = new Map<number, LibraryItemDto>(generate_getLibraryItems().map(item => ([item.id, item])));

const controller_delivery = makeController(fastify => {
    const tags = ["library-controller"];

    fastify.addSchema(LibraryItemDto);
    fastify.addSchema(LibraryViewDto);
    fastify.addSchema(RemoveLibraryItemsDto);

    getLibraryView();
    deleteLibraryItems();


    function getLibraryView() {
        /**
        * The orderId property must always exist only in the case of location === "tender"
        */
        const Querystring_GetLibraryView = Type.Object({
            location: LibraryViewQueryLocation,
            orderId: Type.Optional(Type.Number()),
        }, { $id: "Querystring_GetLibraryView", });

        return fastify.get(
            "/",
            {
                schema: {
                    tags,
                    operationId: "getLibraryView",
                    querystring: Querystring_GetLibraryView,
                    response: {
                        200: LibraryViewDto,
                    },
                },
            },
            async (request, reply) => {
                const { location, orderId } = request.query;
                if (location === "tender") {
                    if (orderId === void 0) throw new Error(`If "location" is "tender", "orderId" must be passed as well`);
                } else {
                    if (orderId !== void 0) throw new Error(`If "location" is NOT "tender", "orderId" must NOT be passed`);
                }
                return reply.send({
                    items: [...MOCK_LIBRARY_ITEMS.values()],
                    isUploadEnabled: true,
                });
            }
        );
    };

    function deleteLibraryItems() {
        return fastify.delete(
            "/",
            {
                schema: {
                    tags,
                    operationId: "deleteLibraryItems",
                    body: RemoveLibraryItemsDto,
                },
            },
            async (request, reply) => {
                const hadTriedToRemoveNonExistentEntry = request.body.removedItems.map(MOCK_LIBRARY_ITEMS.delete).some(success => !success);
                if (hadTriedToRemoveNonExistentEntry) return reply.code(500).send();
                else return reply.code(200).send();
            }
        );
    };

});

function generate_getLibraryItems(): LibraryItemDto[] {
    const _itemIdSource = useIdSource(0, 1);
    const _documentIdSource = useIdSource(100, 1);

    type DateFormat_creationTime = `${number}.${number}.${number}`;

    function makeFile<TName extends string>(ffn: ({ id, documentId }: { id: number, documentId: number, }) => {
        name: TName,

        parentId: number | null,

        description: string | undefined,
        creationTime: DateFormat_creationTime,

        linkUrl: string | undefined,
        documentUrl: string | undefined,
    }): { [K in TName as TName]: LibraryItemDto } {
        const id = _itemIdSource.next();
        const documentId = _documentIdSource.next();
        const { name, description, creationTime, parentId, linkUrl, documentUrl, } = ffn({ id, documentId, });

        const ret = {
            [name]: {
                type: "file",
                id, documentId,
                parentId,
                name, description, creationTime,
                linkUrl, documentUrl,
            }
        } as unknown as { [K in TName as TName]: LibraryItemDto };
        return ret;
    };

    function makeFolder<TName extends string>(ffn: ({ id }: { id: number }) => {
        name: TName,

        parentId: number | null,
    }): { [K in TName as TName]: LibraryItemDto } {
        const id = _itemIdSource.next();
        const { parentId, name, } = ffn({ id });

        const ret = {
            [name]: {
                type: "folder",
                id,
                parentId,
                name,
            }
        } as unknown as { [K in TName as TName]: LibraryItemDto };
        return ret;
    };

    const { Mappa1 } = makeFolder(({ id }) => ({ name: "Mappa1", parentId: null, }));
    const { File_Top_1 } = makeFile(({ id, documentId }) => ({ name: "File_Top_1", parentId: null, description: void 0, creationTime: "2022.10.01", linkUrl: `nav_link_${id}`, documentUrl: `dl_link_${documentId}`, }));
    const { File_Top_2 } = makeFile(({ id, documentId }) => ({ name: "File_Top_2", parentId: null, description: void 0, creationTime: "2022.10.02", linkUrl: `nav_link_${id}`, documentUrl: void 0, }));
    const { File_Top_3 } = makeFile(({ id, documentId }) => ({ name: "File_Top_3", parentId: null, description: void 0, creationTime: "2022.10.03", linkUrl: void 0, documentUrl: `dl_link_${documentId}`, }));

    const { File_L2_1 } = makeFile(({ id, documentId }) => ({ name: "File_L2_1", parentId: Mappa1.id, description: "Description L2-1", creationTime: "2022.10.04", linkUrl: `nav_link_${id}`, documentUrl: void 0, }));
    const { File_L2_2 } = makeFile(({ id, documentId }) => ({ name: "File_L2_2", parentId: Mappa1.id, description: "Description L2-2", creationTime: "2022.10.05", linkUrl: `nav_link_${id}`, documentUrl: `dl_link_${documentId}`, }));
    const { Mappa2 } = makeFolder(({ id }) => ({ name: "Mappa2", parentId: Mappa1.id, }));

    const { File_L3_1 } = makeFile(({ id, documentId }) => ({ name: "File_L3_1", parentId: Mappa2.id, description: void 0, creationTime: "2022.10.06", linkUrl: `nav_link_${id}`, documentUrl: `dl_link_${documentId}`, }));
    const { File_L3_2 } = makeFile(({ id, documentId }) => ({ name: "File_L3_2", parentId: Mappa2.id, description: "Description L3-2", creationTime: "2022.10.07", linkUrl: `nav_link_${id}`, documentUrl: void 0, }));
    const { File_L3_3 } = makeFile(({ id, documentId }) => ({ name: "File_L3_3", parentId: Mappa2.id, description: void 0, creationTime: "2022.10.08", linkUrl: void 0, documentUrl: `dl_link_${documentId}`, }));

    const libraryItems: LibraryItemDto[] = [
        Mappa1,
        File_Top_1,
        File_Top_2,
        File_Top_3,

        File_L2_1,
        File_L2_2,
        Mappa2,

        File_L3_1,
        File_L3_2,
        File_L3_3,
    ];
    return libraryItems;
};
