uniform vec2 u_resolution;
uniform vec3 cameraPos;
uniform vec3 forward;
uniform vec3 right;
uniform vec3 up;
uniform float time;
uniform int _num;
uniform sampler2D renderTexture;

vec2 coord;

const float INF = 1e9;
const float PI = 3.1415926535;
const float EPS = 5e-4;

struct Sphere {
    vec3 pos;
    float r;
    vec3 col;
    float reflectivity;
    float diffusion;

    vec2 intersect(in vec3 ro, in vec3 rd) {
        vec3 oc = ro - pos;
        float b = dot(oc, rd);
        float c = dot(oc, oc) - r * r;
        float h = b * b - c;
        if (h < 0.0) return vec2(-1.0);
        h = sqrt(h);
        return vec2(-b - h, -b + h);
    }

    vec3 norm(vec3 itPos) {
        return normalize(itPos - pos);
    }
};
Sphere sph[] = {{{0.0, 0.0, 0.0}, 1.0, {0.0, 0.0, 1.0}, 0.9, 0.9},
                {{0.0, 5.0, 1.0}, 2.0, {1.0, 0.0, 0.0}, 0.9, 0.9},
                {{10.0, 0.0, 0.0}, 5.0, {1.0, 0.0, 1.0}, 0.9, 0.5},
                {{0.0, 0.0, 10.0}, 3.0, {1.0, 1.0, 1.0}, 0.9, 0.9},
                {{-10.0, 0.0, 0.0}, 2.0, {0.7, 0.7, 0.7}, 0.9, 0.9}};

struct Plain {
    vec4 p;
    vec3 col;
    float reflectivity;
    float diffusion;

    float intersect(in vec3 ro, in vec3 rd) {
        return -(dot(ro, p.xyz) + p.w) / dot(rd, p.xyz);
    }

    vec3 norm(vec3 itPos) {
        return p.xyz;
    }
};
Plain pln[] = {{vec4(normalize(vec3(0.0, 0.0, 1.0)), 3.0), {0.5, 1.0, 0.0}, 0.9, 0.9},
               {vec4(normalize(vec3(-1.0, 0.0, 0.0)), 15.0), {1.0, 0.3, 0.3}, 0.9, 0.3}};

vec3 light = normalize(vec3(1, -0.5, -0.5));
vec3 lightCol = vec3(1.0, 1.0, 1.0);
vec3 skyCol = vec3(0.0);//vec3(0.7, 0.7, 1.0);

struct Intersection {
    vec3 pos;
    int type;
    ////////////////
    //types:      //
    //0 = none    //
    //1 = Sphere  //
    //2 = Plain   //
    ////////////////
    int ind;
};
Intersection castRay(vec3 rayPos, vec3 rayDir) {
    float sphDist = INF;
    int sphInd = -1;
    for (int i = 0; i < sph.length(); ++i) {
        float d = sph[i].intersect(rayPos, rayDir).x;
        if (d > EPS && sphDist > d) {
            sphDist = d;
            sphInd = i;
        }
    }

    float plnDist = INF;
    int plnInd = -1;
    for (int i = 0; i < pln.length(); ++i) {
        float d = pln[i].intersect(rayPos, rayDir);
        if (d > EPS && plnDist > d) {
            plnDist = d;
            plnInd = i;
        }
    }


    Intersection it = {{0.0, 0.0, 0.0}, 0, 0};
    if (sphDist < plnDist && sphInd != -1) {
        it.pos = rayPos + rayDir * sphDist;
        it.type = 1;
        it.ind = sphInd;
    }
    if (plnDist < sphDist && plnInd != -1) {
        it.pos = rayPos + rayDir * plnDist;
        it.type = 2;
        it.ind = plnInd;
    }

    return it;
}

vec2 seed = vec2(0.0, 0.0);
float rand() {
    float ans = fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
    seed.x = ans;
    seed.y = fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
    return ans;
}

vec3 randDir(vec3 rayDir, float randSize) {
    float angle = rand() * PI * 2.0;
    vec2 shift = vec2(cos(angle), sin(angle));
    shift *= tan(rand() * randSize * PI / 2.0);
    if(rand() < 0.0) {
        while(true) {
            shift = vec2(0.0);
        }
    }

    vec2 rayDirXY = normalize(rayDir.xy);
    vec3 right = vec3(rayDirXY.y, -rayDirXY.x, 0.0);
    vec3 up = vec3(-rayDirXY * rayDir.z, length(rayDir.xy));

    vec3 newDir = normalize(rayDir + right * shift.x + up * shift.y);
    return newDir;
}

struct Surface {
    vec3 col;
    float reflectivity;
    float diffusion;
};
vec3 getColor(vec3 rayPos, vec3 rayDir) {
    Surface[50] st;

    vec3 col = vec3(0.0);
    for (int i = 0; i < st.length(); ++i) {
        Intersection it = castRay(rayPos, rayDir);

        vec3 norm;
        vec3 _col;
        float reflectivity;
        float diffusion;

        if (it.type == 0) {
            float rayPow = max(0.0, pow(max(0.0, dot(rayDir, -light)), 4.0));
            col = lightCol * rayPow;

            --i;
            for (; i >= 0; --i) {
                col *= 1 - st[i].diffusion;
                col += (st[i].col * pow(rayPow, 0.5)) * st[i].diffusion;
                rayPow *= st[i].reflectivity;
            }

            return col;
        }
        if (it.type == 1) {
            norm = sph[it.ind].norm(it.pos);
            _col = sph[it.ind].col;
            reflectivity = sph[it.ind].reflectivity;
            diffusion = sph[it.ind].diffusion;
        }
        if (it.type == 2) {
            norm = pln[it.ind].norm(it.pos);
            _col = pln[it.ind].col;
            reflectivity = pln[it.ind].reflectivity;
            diffusion = pln[it.ind].diffusion;
        }

        rayPos = it.pos;
        vec3 newRayDir = randDir(reflect(rayDir, norm), diffusion);
        float newIt;
        if (it.type == 1) {
            newIt = sph[it.ind].intersect(rayPos, newRayDir).y;
            for (int cnt = 0; cnt < 10 && newIt > EPS; ++cnt) {
                newRayDir = randDir(reflect(rayDir, norm), diffusion);
                newIt = sph[it.ind].intersect(rayPos, newRayDir).y;
            }
        }

        rayDir = newRayDir;
        st[i] = Surface(_col, reflectivity, diffusion);
    }
    
    return col;
}

void main() {
    coord = (gl_FragCoord.xy / u_resolution - 0.5) * u_resolution / u_resolution.y;
    coord.y *= -1;
    vec2 textureCoord = gl_FragCoord.xy / u_resolution;
    seed = coord + time;

    vec3 rayDir = normalize(forward + right * coord.x + up * coord.y);

    vec3 col = getColor(cameraPos, rayDir);

    float gamma = 0.6;
    col.x = pow(col.x, gamma);
    col.y = pow(col.y, gamma);
    col.z = pow(col.z, gamma);

    gl_FragColor = vec4((col + texture(renderTexture, textureCoord).rgb * _num) / (_num + 1.0), 1.0);
}