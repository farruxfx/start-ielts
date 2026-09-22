import { render, screen, fireEvent } from '@testing-library/react';
import { VirtualList } from '../ui/virtual-list';

const items = Array.from({ length: 500 }, (_, i) => ({ id: i, label: `Item ${i}` }));

describe('VirtualList', () => {
  test('renders only a window of items, not all 500', () => {
    render(
      <VirtualList
        items={items}
        itemHeight={40}
        height={400}
        getKey={(item) => item.id}
        renderItem={(item) => <div>{item.label}</div>}
      />
    );

    const rendered = screen.getAllByRole('listitem');
    // 400px / 40px = 10 visible + overscan(5) above + below ≈ ≤ 25
    expect(rendered.length).toBeLessThan(30);
    expect(rendered.length).toBeGreaterThan(0);
    expect(screen.getByText('Item 0')).toBeInTheDocument();
    expect(screen.queryByText('Item 499')).not.toBeInTheDocument();
  });

  test('sizes the scroll area to total rows', () => {
    const { container } = render(
      <VirtualList items={items} itemHeight={40} height={400} renderItem={(item) => <div>{item.label}</div>} />
    );
    const inner = container.querySelector('[role="list"] > div') as HTMLElement;
    expect(inner.style.height).toBe('20000px'); // 500 * 40
  });

  test('renders a different window after scrolling', () => {
    const { container } = render(
      <VirtualList
        items={items}
        itemHeight={40}
        height={400}
        overscan={0}
        getKey={(item) => item.id}
        renderItem={(item) => <div>{item.label}</div>}
      />
    );

    const scroller = container.querySelector('[role="list"]') as HTMLElement;
    // jsdom has no layout engine — stub scrollTop on the instance
    Object.defineProperty(scroller, 'scrollTop', { value: 4000, configurable: true });
    fireEvent.scroll(scroller);

    expect(screen.getByText('Item 100')).toBeInTheDocument();
    expect(screen.queryByText('Item 0')).not.toBeInTheDocument();
  });

  test('supports column (grid) mode', () => {
    render(
      <VirtualList
        items={items}
        itemHeight={100}
        height={300}
        columns={3}
        getKey={(item) => item.id}
        renderItem={(item) => <div>{item.label}</div>}
      />
    );
    // 300px / 100px = 3 rows * 3 cols = 9 visible (overscan rows add up to 5 rows * 3)
    const rendered = screen.getAllByRole('listitem');
    expect(rendered.length).toBeLessThanOrEqual(9 + 5 * 3);
    expect(rendered.length % 3).toBe(0);
  });

  test('pads incomplete last row', () => {
    const short = items.slice(0, 4); // 4 items, 3 columns → last row has 1 item + 2 pads
    const { container } = render(
      <VirtualList items={short} itemHeight={100} height={500} columns={3} renderItem={(item) => <div>{item.label}</div>} />
    );
    const pads = container.querySelectorAll('[aria-hidden="true"]');
    expect(pads.length).toBe(2);
  });
});
