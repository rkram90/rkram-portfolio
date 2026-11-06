import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';

import { Content } from '../../core/services/content';
import { Projects } from './projects';

describe('Projects', () => {
  let fixture: ComponentFixture<Projects>;
  let el: HTMLElement;

  async function setup(query: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(query) } } },
      ],
    });
    fixture = TestBed.createComponent(Projects);
    el = fixture.nativeElement;
    await fixture.whenStable();
  }

  const titles = () => Array.from(el.querySelectorAll('app-project-card h3')).map((h) => h.textContent?.trim());
  const button = (label: string) =>
    Array.from(el.querySelectorAll<HTMLButtonElement>('button.toggle')).find((b) => b.textContent?.trim() === label)!;
  const click = async (b: HTMLElement) => {
    b.click();
    await fixture.whenStable();
  };

  it('lists every project in order', async () => {
    await setup();
    expect(titles()).toEqual(TestBed.inject(Content).projects().map((p) => p.title));
    expect(el.querySelector('.count')?.textContent).toContain('6 projects');
  });

  it('filters by type and tech, syncing the URL', async () => {
    await setup();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    await click(button('Personal'));
    expect(titles()).toEqual(['This Portfolio Site']);
    expect(button('Personal').getAttribute('aria-pressed')).toBe('true');

    await click(button('All'));
    await click(button('DuckDB'));
    expect(titles()).toEqual(['Fare Automation Platform']);
    expect(navigate).toHaveBeenLastCalledWith([], expect.objectContaining({ queryParams: { type: null, tech: 'DuckDB' } }));

    await click(button('DuckDB'));
    expect(titles().length).toBe(6);
  });

  it('reads filters from query params and shows the empty state', async () => {
    await setup({ type: 'personal', tech: 'DuckDB,Bogus' });
    expect(titles()).toEqual([]);
    expect(el.querySelector('.empty')?.textContent).toContain('No projects match');

    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await click(el.querySelector<HTMLButtonElement>('.empty button')!);
    expect(titles().length).toBe(6);
  });
});
