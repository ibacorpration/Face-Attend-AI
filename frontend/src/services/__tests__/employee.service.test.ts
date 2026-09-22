import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../api';
import { employeeService } from '../employee.service';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('employeeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch employees successfully', async () => {
    const mockEmployees = [{ id: 1, full_name: 'John Doe', status: 'active' }];
    (api.get as any).mockResolvedValue({ data: mockEmployees });

    const result = await employeeService.getEmployees();

    expect(api.get).toHaveBeenCalledWith('/employees/');
    expect(result).toEqual(mockEmployees);
  });

  it('should create employee', async () => {
    const newEmp = { full_name: 'Jane Doe' };
    const mockResponse = { id: 2, ...newEmp };
    (api.post as any).mockResolvedValue({ data: mockResponse });

    const result = await employeeService.createEmployee(newEmp);

    expect(api.post).toHaveBeenCalledWith('/employees/', newEmp);
    expect(result).toEqual(mockResponse);
  });

  it('should upload face data as FormData', async () => {
    const mockBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
    (api.post as any).mockResolvedValue({ data: { success: true } });

    await employeeService.enrollFace(1, mockBlob);

    expect(api.post).toHaveBeenCalledWith('/employees/1/face', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  });
});
