import { ArticleApiResponse } from '../definitions/articles.types';

export const blogpostsData: ArticleApiResponse[] = [
  {
    status: 'success',
    data: {
      article: {
        _id: '69678e90c7bd34b130acea50',
        title: 'image test again',
        description: 'this is a test',
        content: [
          {
            type: 'heading',
            id: 'dZJBk-Iw',
            markDefs: [],
            level: 2,
            content: [
              {
                type: 'text',
                text: 'Images',
                marks: [],
              },
            ],
          },
          {
            type: 'paragraph',
            id: 'ufNXogsC',
            markDefs: [],
            content: [
              {
                type: 'text',
                text: 'using image tag\n',
                marks: [],
              },
            ],
          },
          {
            type: 'image',
            id: 'ysuC6qxd',
            markDefs: [],
            imageId: '6962e847d8cff9ce2b39a74f',
            alt: 'This is an alt text.',
          },
        ],
        tags: ['tips', 'start here', 'begginer'],
        keywords: [],
        websiteId: '6935e336ec55b4d9c83bf9f9',
        categoryId: '693d9ebd5ad12255cac31c34',
        audienceIds: [],
        authorId: '693e8e4ad0ef91dee1eab972',
        organization: '695188442ecda034a1fe2e27',
        aiGenerated: false,
        status: 'approved',
        hasGeneratedImages: true,
        pendingImageCount: 0,
        createdAt: '2026-01-14T12:39:44.393Z',
        updatedAt: '2026-01-19T08:24:59.260Z',
        slug: 'image-test-again',
        __v: 0,
        id: '69678e90c7bd34b130acea50',
      },
      images: {
        '6962e847d8cff9ce2b39a74f': {
          status: 'completed',
          url: '',
          prompt: 'generate a snow man on a beach',
        },
      },
    },
  },
];
