#include "Objects.h"

void setMousePos() {
    //Mouse::setPosition(Vector2i(1000, 500));
}

class Camera {
public:
    const float moveSpeed = 0.0, rotationSpeed = 0.0;

    Vector3f pos;
    Vector2f rot;
    Vector3f forward, right, up;

    void update(float time, const std::vector <Sphere>& sph) {
        Vector3f shift;
        if (Keyboard::isKeyPressed(Keyboard::W))
            shift.x += moveSpeed * time;
        if (Keyboard::isKeyPressed(Keyboard::S))
            shift.x -= moveSpeed * time;
        if (Keyboard::isKeyPressed(Keyboard::D))
            shift.y += moveSpeed * time;
        if (Keyboard::isKeyPressed(Keyboard::A))
            shift.y -= moveSpeed * time;
        if (Keyboard::isKeyPressed(Keyboard::E))
            shift.z += moveSpeed * time;
        if (Keyboard::isKeyPressed(Keyboard::Q))
            shift.z -= moveSpeed * time;
        if (Keyboard::isKeyPressed(Keyboard::LShift))
            shift *= 5.0f;

        Vector2i mouseShift = Mouse::getPosition() - Vector2i(1000, 500);
        setMousePos();
        rot += Vector2f(-mouseShift.x, -mouseShift.y) * rotationSpeed * time;
        rot.y = std::min(PI / 2, std::max(-PI / 2, rot.y));

        forward = getVec(rot);
        right = getVec(Vector2f(rot.x - PI / 2, 0));
        up = getVec(Vector2f(rot.x, rot.y + PI / 2));

        Vector3f newPos = pos + forward * shift.x + right * shift.y + up * shift.z;
        bool isIntersect = false;
        for (const auto& s : sph)
            if (s.intersect(newPos))
                isIntersect = true;

        if (!isIntersect)
            pos = newPos;
    }
};

class Scene {
public:
    Camera camera;

    std::vector <Sphere> sph = {/* Sphere(Vector3f(0, 0, 0), 1), Sphere(Vector3f(0, 5, 1), 2)*/};

    Scene() {
        camera.pos = { -10, 15, 20 };
        camera.rot = { -PI / 4, -PI / 4 };
    }

    void update(float time) {
        camera.update(time, sph);
    }
};