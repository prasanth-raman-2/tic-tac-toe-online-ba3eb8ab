import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('Tic Tac Toe Game', () => {
  test('renders game title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Tic Tac Toe/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders empty board initially', () => {
    render(<App />);
    const squares = screen.getAllByRole('button', { name: '' });
    expect(squares).toHaveLength(9);
    squares.forEach(square => {
      expect(square).toBeEmpty();
    });
  });

  test('shows correct player turn information', () => {
    render(<App />);
    const statusElement = screen.getByText(/Next player: X/i);
    expect(statusElement).toBeInTheDocument();
  });

  test('updates square with X on first click', () => {
    render(<App />);
    const squares = screen.getAllByRole('button', { name: '' });
    fireEvent.click(squares[0]);
    expect(squares[0]).toHaveTextContent('X');
  });

  test('alternates between X and O', () => {
    render(<App />);
    const squares = screen.getAllByRole('button', { name: '' });
    
    fireEvent.click(squares[0]);
    expect(squares[0]).toHaveTextContent('X');
    
    fireEvent.click(squares[1]);
    expect(squares[1]).toHaveTextContent('O');
  });

  test('detects winning condition', () => {
    render(<App />);
    const squares = screen.getAllByRole('button', { name: '' });
    
    // Create winning line for X
    fireEvent.click(squares[0]); // X
    fireEvent.click(squares[3]); // O
    fireEvent.click(squares[1]); // X
    fireEvent.click(squares[4]); // O
    fireEvent.click(squares[2]); // X

    expect(screen.getByText(/Winner: X/i)).toBeInTheDocument();
  });

  test('detects draw condition', () => {
    render(<App />);
    const squares = screen.getAllByRole('button', { name: '' });
    
    // Fill board without winner
    const moves = [0, 1, 2, 4, 3, 6, 5, 8, 7];
    moves.forEach(pos => {
      fireEvent.click(squares[pos]);
    });

    expect(screen.getByText(/Game Draw!/i)).toBeInTheDocument();
  });

  test('reset button clears the board', () => {
    render(<App />);
    const squares = screen.getAllByRole('button', { name: '' });
    
    // Make some moves
    fireEvent.click(squares[0]);
    fireEvent.click(squares[1]);
    
    // Click reset button
    const resetButton = screen.getByText(/Reset Game/i);
    fireEvent.click(resetButton);
    
    // Check if board is cleared
    squares.forEach(square => {
      expect(square).toBeEmpty();
    });
    
    // Check if game status is reset
    expect(screen.getByText(/Next player: X/i)).toBeInTheDocument();
  });

  test('prevents clicking on filled squares', () => {
    render(<App />);
    const squares = screen.getAllByRole('button', { name: '' });
    
    fireEvent.click(squares[0]);
    const firstValue = squares[0].textContent;
    
    fireEvent.click(squares[0]);
    expect(squares[0].textContent).toBe(firstValue);
  });

  test('prevents further moves after game is won', () => {
    render(<App />);
    const squares = screen.getAllByRole('button', { name: '' });
    
    // Create winning line
    fireEvent.click(squares[0]); // X
    fireEvent.click(squares[3]); // O
    fireEvent.click(squares[1]); // X
    fireEvent.click(squares[4]); // O
    fireEvent.click(squares[2]); // X wins

    // Try to make another move
    fireEvent.click(squares[5]);
    expect(squares[5]).toBeEmpty();
  });
});
