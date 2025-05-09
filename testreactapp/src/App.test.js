import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import App from './App';
import * as api from './services/api';

jest.mock('./services/api');

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders navigation bar with all links', () => {
    renderWithRouter(<App />);
    
    expect(screen.getByText(/Face Recognition/i)).toBeInTheDocument();
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
    expect(screen.getByText(/Identify/i)).toBeInTheDocument();
    expect(screen.getByText(/Results/i)).toBeInTheDocument();
    expect(screen.getByText(/History/i)).toBeInTheDocument();
  });

  test('navigation links are clickable and lead to correct routes', async () => {
    renderWithRouter(<App />);

    await act(async () => {
      fireEvent.click(screen.getByText(/Admin/i));
    });
    expect(window.location.pathname).toBe('/admin');

    await act(async () => {
      fireEvent.click(screen.getByText(/Identify/i));
    });
    expect(window.location.pathname).toBe('/identify');
  });

  test('mobile menu button appears on small screens', () => {
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));

    renderWithRouter(<App />);
    const menuButton = screen.getByRole('button', { name: /menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  test('mobile menu opens and closes', async () => {
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));

    renderWithRouter(<App />);
    
    const menuButton = screen.getByRole('button', { name: /menu/i });
    
    await act(async () => {
      fireEvent.click(menuButton);
    });
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('open');

    await act(async () => {
      fireEvent.click(menuButton);
    });
    expect(nav).not.toHaveClass('open');
  });
});

describe('API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handles API errors gracefully', async () => {
    api.getSystemStats.mockRejectedValue(new api.APIError('Server error', 500));

    renderWithRouter(<App />);
    
    await waitFor(() => {
      expect(screen.queryByText(/error occurred/i)).toBeInTheDocument();
    });
  });

  test('displays loading states while fetching data', async () => {
    api.getSystemStats.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderWithRouter(<App />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });
});

describe('Accessibility', () => {
  test('navigation is keyboard accessible', () => {
    renderWithRouter(<App />);
    
    const navLinks = screen.getAllByRole('link');
    
    navLinks[0].focus();
    expect(document.activeElement).toBe(navLinks[0]);
    
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(navLinks[1]);
  });

  test('has proper ARIA attributes', () => {
    renderWithRouter(<App />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label');
    
    const menuButton = screen.queryByRole('button', { name: /menu/i });
    if (menuButton) {
      expect(menuButton).toHaveAttribute('aria-expanded');
      expect(menuButton).toHaveAttribute('aria-controls');
    }
  });
});

describe('Error Boundary', () => {
  test('catches and displays runtime errors', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    const { container } = render(
      <App>
        <ErrorComponent />
      </App>
    );

    expect(container).toHaveTextContent(/something went wrong/i);
  });
});

afterAll(() => {
  jest.resetModules();
});
