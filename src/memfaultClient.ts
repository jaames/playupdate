const API_BASE = 'https://api.memfault.com/api/v0/';
const USER_AGENT = 'Playdate/1.7.0';

interface IMemfaultResponse {
  data?: any;
  error?: {
    code: number;
    http_code: number;
    message: string;
    type: string;
  };
};

class MemfaultError extends Error {
  type: string;
  constructor(type: string, message: string) {
    super(message);
    this.type = type;
  }
}

function authHeaders() {
  return {
    'User-Agent': USER_AGENT,
    'Memfault-Project-Key': MEMFAULT_PROJECT_KEY
  };
}

function get<T extends IMemfaultResponse>(route: string) {
  return async (params: Record<string, any> = {}): Promise<T> => {

    const url = new URL(route, API_BASE);
    Object.entries(params).forEach(([key, val]) => url.searchParams.set(key, val));
    const res = await fetch(url.toString(), {
      headers: authHeaders()
    });

    const contentType = res.headers.get('content-type');
    const content = await res.text(); // memfault seems tto decide not to send the content-length header sometimes... ?

    if (contentType !== 'application/json')
      throw new MemfaultError('NoJson', '');

    if (!content)
      throw new MemfaultError('NoContent', '');

    const json = JSON.parse(content);
    const err = json.error;

    if (err)
      throw new MemfaultError(err.type, err.message);

    return json;
  }
}

export interface IMemfaultArtifact {
  build_id: string;
  created_date: string;
  extra_info: any;
  filename: string;
  hardware_version: string;
  id: number;
  md5: string;
  type: string;
  url: string;
};

export interface IMemfaultReleasesResponse extends IMemfaultResponse {
  artifacts: IMemfaultArtifact[];
  created_date: string;
  display_name: string;
  extra_info: any;
  id: number;
  min_version: string;
  must_pass_through: boolean;
  notes: string;
  reason: string;
  revision: string;
  version: string;
};

export const getLatestRelease = get<IMemfaultReleasesResponse>('releases/latest');