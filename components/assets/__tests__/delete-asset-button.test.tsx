import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteAssetButton } from '../delete-asset-button';
import { deleteAsset } from '@/app/actions/assets';

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock delete asset action
vi.mock('@/app/actions/assets', () => ({
  deleteAsset: vi.fn(),
}));

describe('DeleteAssetButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render delete button', () => {
    render(<DeleteAssetButton assetId={1} assetName="Test Asset" />);

    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toBeInTheDocument();
  });

  it('should open confirmation dialog when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteAssetButton assetId={1} assetName="Test Asset" />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Check dialog opens with confirmation message
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText(/This will permanently delete "Test Asset"/i)).toBeInTheDocument();
  });

  it('should display asset name in confirmation dialog', async () => {
    const user = userEvent.setup();
    render(<DeleteAssetButton assetId={1} assetName="Central Air Conditioner" />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(screen.getByText(/"Central Air Conditioner"/)).toBeInTheDocument();
  });

  it('should close dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteAssetButton assetId={1} assetName="Test Asset" />);

    // Open dialog
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    });
  });

  it('should call deleteAsset and navigate when confirmed', async () => {
    const user = userEvent.setup();
    vi.mocked(deleteAsset).mockResolvedValue(true);

    render(<DeleteAssetButton assetId={123} assetName="Test Asset" />);

    // Open dialog
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete asset/i });
    await user.click(confirmButton);

    // Should call deleteAsset with correct ID
    await waitFor(() => {
      expect(deleteAsset).toHaveBeenCalledWith(123);
      expect(mockPush).toHaveBeenCalledWith('/assets');
    });
  });

  it('should call deleteAsset with correct ID when confirmed', async () => {
    const user = userEvent.setup();
    vi.mocked(deleteAsset).mockResolvedValue(true);

    render(<DeleteAssetButton assetId={456} assetName="Test Asset" />);

    // Open dialog
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete asset/i });
    await user.click(confirmButton);

    // Should call deleteAsset with the correct asset ID
    await waitFor(() => {
      expect(deleteAsset).toHaveBeenCalledWith(456);
    });
  });

  it('should handle delete errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    const error = new Error('Failed to delete');
    vi.mocked(deleteAsset).mockRejectedValue(error);

    render(<DeleteAssetButton assetId={1} assetName="Test Asset" />);

    // Open dialog
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete asset/i });
    await user.click(confirmButton);

    // Should log error
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to delete asset:', error);
    });

    // Should NOT navigate on error
    expect(mockPush).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should not navigate when deletion fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    vi.mocked(deleteAsset).mockRejectedValue(new Error('Database error'));

    render(<DeleteAssetButton assetId={1} assetName="Test Asset" />);

    // Open dialog
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete asset/i });
    await user.click(confirmButton);

    // Wait for the delete action to complete
    await waitFor(() => {
      expect(deleteAsset).toHaveBeenCalled();
    });

    // Should not navigate when error occurs
    expect(mockPush).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
