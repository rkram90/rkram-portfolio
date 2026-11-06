import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { Employer } from '../../../core/models/content.schema';
import { CareerTimeline } from './career-timeline';

const EMPLOYERS: Employer[] = [
  {
    id: 'b',
    company: 'Beta',
    location: 'Chennai',
    start: '2020-01',
    end: null,
    titles: [{ title: 'Lead', start: '2020-01', end: null }],
    engagements: [
      {
        id: 'b1',
        name: 'Portal',
        client: 'A US airline',
        roles: [
          { title: 'Analyst', start: '2020-01', end: '2020-12' },
          { title: 'Lead', start: '2021-01', end: null },
        ],
        start: '2020-01',
        end: null,
        summary: 'Summary',
        highlights: ['Did a thing'],
        tech: ['Angular'],
        versions: { Angular: '19' },
      },
      {
        id: 'b2',
        name: 'Old',
        client: 'A carrier',
        roles: [{ title: 'Analyst', start: '2020-01', end: '2020-06' }],
        start: '2020-01',
        end: '2020-06',
        summary: 'Older work',
        highlights: [],
        tech: [],
      },
    ],
  },
  {
    id: 'a',
    company: 'Alpha',
    location: 'Chennai',
    start: '2010-01',
    end: '2019-12',
    titles: [{ title: 'Dev', start: '2010-01', end: '2019-12' }],
    highlights: ['Wrote PHP'],
  },
];

/** Gives an element a fixed viewport rect (jsdom has no layout). */
function stubRect(el: Element, top: number, height: number) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({ top, height, bottom: top + height } as DOMRect);
}

describe('CareerTimeline', () => {
  let fixture: ComponentFixture<CareerTimeline>;
  let el: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(CareerTimeline);
    fixture.componentRef.setInput('employers', EMPLOYERS);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => vi.restoreAllMocks());

  it('renders employers, engagements and highlights from data', () => {
    expect(Array.from(el.querySelectorAll('h2')).map((h) => h.textContent)).toEqual(['Beta', 'Alpha']);
    const details = el.querySelectorAll('details');
    expect(details.length).toBe(2);
    expect(details[0].open).toBe(true);
    expect(details[1].open).toBe(false);
    expect(el.querySelector('.roles')?.textContent?.replace(/\s+/g, ' ')).toContain('Analyst (Jan 2020 – Dec 2020) → Lead (Jan 2021 – Present)');
    expect(el.querySelector('.chips')?.textContent).toContain('Angular 19');
    expect(el.textContent).toContain('Wrote PHP');
  });

  /** Viewport 1000px tall with `remaining` px of scroll left below. */
  function stubPage(remaining: number) {
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1000);
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(0);
    vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(1000 + remaining);
  }

  async function markerY() {
    fixture.componentInstance.update();
    await fixture.whenStable();
    return el.style.getPropertyValue('--marker-y');
  }

  it('moves the marker in step with scroll progress', async () => {
    stubPage(500);
    stubRect(el.querySelector('ol')!, -100, 2000); // halfway between anchor (400) and max scroll
    expect(await markerY()).toBe('1000px');
  });

  it('reaches the last row at the bottom of the page', async () => {
    stubPage(0);
    stubRect(el.querySelector('ol')!, -600, 2000);
    expect(await markerY()).toBe('2000px');
  });

  it('stays at the top before the timeline reaches the anchor', async () => {
    stubPage(3000);
    stubRect(el.querySelector('ol')!, 900, 2000);
    expect(await markerY()).toBe('0px');
  });

  it('removes its listeners on destroy', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    window.dispatchEvent(new Event('scroll'));
    fixture.destroy();
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
