# pandan-ass

一个熊猫 TV 直播弹幕录制工具。开播自动录制，下播自动转换。意外中止只需重启程序。

暂时没有字体/表情/高能支持。

## Requirements

nodejs, python3, danmaku2ass

## Installation

```bash
npm i
mkdir 3rd
cd 3rd
wget https://github.com/m13253/danmaku2ass/archive/master.tar.gz -O - | tar xzv
cd ..
mkdir output
cp config.example.json config.json
vim config.json
```

## Config

```json
{
  "path": {
    "python": "/usr/bin/python3", // path of python3
    "danmaku2ass": "./3rd/danmaku2ass-master/danmaku2ass.py", // path of danmaku2ass, relative to current directory or absolute
    "output": "./output" // path of output directory, relative to current directory or absolute
  },
  "args": {
    "danmaku2ass": [ // danmaku2ass args
      "-s", "1152x648", "-fn", "Microsoft YaHei",
      "-fs", "30", "-a", "0.8", "-dm", "7"
    ]
  },
  "timeOffset": -6, // time offset when rendering danmaku; useful due to delay of streaming
  "room": 10029 // the room id which this program should connect to
}
```

## License

AGPLv3