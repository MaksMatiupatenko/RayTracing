#include "Base.h"

class Sphere {
public:
    Vector3f pos;
    float r;

    Sphere(Vector3f pos = Vector3f(0, 0, 0), float r = 0) :pos(pos), r(r) {}

    bool intersect(Vector3f point) const {
        return length(pos - point) <= r;
    }
};