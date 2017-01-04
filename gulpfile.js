// модуль, позволяющий включать таски из вложенных директорий
var requireDir = require('require-dir');

// устанавливаем значение глобальной переменной,
// позволяющей различать в тасках development & production окружения
global.devBuild = process.env.NODE_ENV !== 'production';

// пробрасываем сборщик в папку с тасками и конфигом
requireDir('./lib/gulp/tasks', { recurse: true });