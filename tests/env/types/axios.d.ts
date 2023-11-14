type AxiosMethod = import("@fmg/filters/api-filter").AxiosMethod;

type AxiosMethods = {
    [key in AxiosMethod]: jest.Mock<Promise<any>>
}

interface AxiosDefaults {
    baseURL: string;
}

interface AxiosMock extends AxiosMethods {
    defaults: AxiosDefaults;
}