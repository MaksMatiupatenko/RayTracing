#include "Scene.h"

bool isFullScreen = false;
void setFullScreen(RenderWindow& window, RenderTexture& renderTexture) {
    screenWight = VideoMode::getDesktopMode().width;
    screenHeight = VideoMode::getDesktopMode().height;
    window.create(VideoMode::getDesktopMode(), "window", Style::Fullscreen);
    renderTexture.create(screenWight, screenHeight);
    isFullScreen = true;
    window.setMouseCursorVisible(false);
    Mouse::setPosition(Vector2i(1000, 500));

    //cameraRot = Vector2f(0, 0);
}
void setNormalScreen(RenderWindow& window, RenderTexture& renderTexture) {
    screenWight = 800;
    screenHeight = 450;
    window.create(VideoMode(screenWight, screenHeight), "window");
    renderTexture.create(screenWight, screenHeight);
    isFullScreen = false;
    window.setMouseCursorVisible(true);
    Mouse::setPosition(Vector2i(1000, 500));

    //cameraRot = Vector2f(0, 0);
}

int main() {
    sf::RenderWindow window(sf::VideoMode(screenWight, screenHeight), "window");
    RenderTexture renderTexture;
    renderTexture.create(screenWight, screenHeight);
    window.setFramerateLimit(10);
    window.setKeyRepeatEnabled(false);

    Shader shader;
    shader.loadFromFile("render.frag", Shader::Fragment);


    Clock clock;

    Texture floppa;
    floppa.loadFromFile("bigFloppa.jpg");
    Texture none;
    none.loadFromFile("none.png");

    Scene scene;

    float fullTime = 0;
    int _num = 0;
    setMousePos();
    setFullScreen(window, renderTexture);
    while (window.isOpen()) {
        sf::Event event;
        while (window.pollEvent(event)) {
            if (event.type == sf::Event::Closed) {
                window.close();
            }
            /*if (event.type == Event::KeyPressed) {
                if (event.key.code == Keyboard::F11) {
                    if (!isFullScreen) setFullScreen(window, renderTexture);
                    else setNormalScreen(window, renderTexture);
                }
            }*/
            if (event.type == Event::GainedFocus) {
                setMousePos();
                clock.restart();
            }
        }

        if (window.hasFocus()) {
            float time = clock.restart().asSeconds();
            fullTime += time;

            scene.update(time);

            shader.setUniform("u_resolution", Vector2f(screenWight, screenHeight));
            shader.setUniform("cameraPos", scene.camera.pos);
            shader.setUniform("forward", scene.camera.forward);
            shader.setUniform("right", scene.camera.right);
            shader.setUniform("up", scene.camera.up);
            shader.setUniform("time", fullTime);
            shader.setUniform("_num", _num);
            shader.setUniform("renderTexture", renderTexture.getTexture());

            RectangleShape renderTarget(Vector2f(screenWight, screenHeight));
            renderTarget.setPosition(0, 0);
            renderTarget.setFillColor(Color::Black);

            renderTexture.draw(renderTarget, &shader);
            ++_num;

            window.clear();
            window.draw(Sprite(renderTexture.getTexture()));
            window.display();
        }
    }
}