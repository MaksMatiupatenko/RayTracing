#include <SFML/Graphics.hpp>
#include <iostream>
#include <cmath>
#include <vector>

const float PI = 3.1415926535;

using namespace sf;
int screenWight = 800, screenHeight = 450;

void normalize(Vector3f& vec) {
    vec /= sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
}
float length(const Vector3f& vec) {
    return sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
}

Vector3f getVec(const Vector2f& Rot) {
    Vector2f ansXY(cos(Rot.x), sin(Rot.x));
    Vector3f ans(ansXY.x * cos(Rot.y), ansXY.y * cos(Rot.y), sin(Rot.y));

    return ans;
}
