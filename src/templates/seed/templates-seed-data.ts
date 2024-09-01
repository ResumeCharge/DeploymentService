import { CreateTemplateDto } from '../dto/create-template.dto';

const templatesSeedData: CreateTemplateDto[] = [
  {
    _id: 'alembic',
    mainImage: 'https://picsum.photos/200/300',
    description:
      'Simple one page website template. Clean and modern while providing a great user experience.',
    name: 'Alembic',
  },
  {
    _id: 'springfield',
    mainImage: 'https://picsum.photos/200/300',
    description:
      'One page website template that highlights your skills and experience.',
    name: 'Springfield',
  },
  {
    _id: 'midgard',
    mainImage: 'https://picsum.photos/200/300',
    description:
      'Dark themed single page template, modern typeface and design with a clean look.',
    name: 'Midgard',
  },
  {
    _id: 'beautiful-jekyll',
    mainImage: 'https://picsum.photos/200/300',
    description:
      'Multi page website with separate sections for work experience, skills, and more. An organized and well designed websites for candidates with lots to share.',
    name: 'Beautiful Jekyll',
  },
  {
    _id: 'minimal-mistakes',
    mainImage: 'https://picsum.photos/200/300',
    description:
      'Popular, modern and beautiful, Minimal Mistakes is a well known static site template used for every type of website, from portfolio sites to blogs.',
    name: 'Minimal Mistakes',
  },
  {
    _id: 'hyde',
    mainImage: 'https://picsum.photos/200/300',
    description:
      'Multi page sidebar style website template. Sharp constrast to catch users attention and highlight your best attributes.',
    name: 'Hyde',
  },
];

export { templatesSeedData };
