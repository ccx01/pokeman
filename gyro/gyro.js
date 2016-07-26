/**
 * @author Sign
 * @version 1.0
 * @date 2015-11-10
 * @description 重力感应插件
 * @extends mo.Base
 * @name mo.Gyro
*/
(function() {
	/**
	 * public 作用域
	 * @alias mo.Action#
	 * @ignore
	 */
	/*var _public = this;

	var _private = {};

	var _static = this.constructor;*/


	var target;	//绑定元素

	var range = function(a, b) {
		//范围计算
		return this > a && this < b;
	}

	var offset = {
		a: 0,
		b: 0,
		g: 0,
		x: 0,
		y: 0,
		z: 0
	}


	var Gyro = {};
	var coor = {};
	var elem = {};
	var stage = {};

	var page_scale_x,
		page_scale_y;

	//初始位置
	var ori;

	//上次坐标，用来计算改变速度
	var last_coor = {};
	var last_time = new Date().getTime();


	//设置参数
	var config;
	var sens = 300;	//动作判定间隔时间

	//反馈信息
	var msg = "无动作";

	Gyro.init = function(cfg) {
		// 初始化参数

		config = cfg;

		sens = config.sens || sens;

		node = config.target;

		if(config.stage) {
			page_scale_x = config.stage.offsetWidth / 140;
			page_scale_y = config.stage.offsetHeight / 60;
		} else {
			page_scale_x = screen.width / 140;
			page_scale_y = screen.height / 60;
		}

		Gyro.target = node;

		if (window.DeviceMotionEvent) {
			window.addEventListener('deviceorientation', deviceorientation, false);
		} else {
			alert("当前设备不支持deviceorientation");
		}
		if (window.DeviceMotionEvent) {
			window.addEventListener('devicemotion', devicemotion, false);
		} else {
			alert("当前设备不支持devicemotion");
		}

		// 等陀螺仪事件生效
		setTimeout(Gyro.setOri, 100);
	}

	Gyro.connect = function() {
		window.addEventListener('deviceorientation', deviceorientation);
		window.addEventListener('devicemotion', devicemotion);
	}

	Gyro.disconnect = function() {
		window.removeEventListener('deviceorientation', deviceorientation);
		window.removeEventListener('devicemotion', devicemotion);
	}

	var deviceorientation = function(e, callback) {

		var a = e.alpha;
		var b = e.beta;
		var g = e.gamma;
		a = a > 180 ? a - 360 : a;

		coor = {
			"a": a,
			"b": b,
			"g": g
		}

		// !ori && (ori = coor);

		//绑定元素
		config.target && response[config.mode](Gyro.target);

		//用户自定义函数
		config.callback && config.callback(coor, gravity, msg, motion_callback);
	}

	var last_gravity = {};
	var gravity;
	var cur_time = 0;
	var last_time = 0;

	// 动作反馈
	var motion_callback = {};

	//姿势响应
	var devicemotion = function(e) {

		gravity = e.accelerationIncludingGravity;
		cur_time = new Date().getTime();

		if ((cur_time - last_time) > sens) {
			var dur_time = cur_time - last_time; 

			offset = {
				a: Gyro.getOffsetOri().a,
				b: Gyro.getOffsetOri().b,
				g: Gyro.getOffsetOri().g,
				x: Gyro.getOffsetGravity().x,
				y: Gyro.getOffsetGravity().y,
				z: Gyro.getOffsetGravity().z
			}

			// msg = Math.round(offset.x) + " " + Math.round(offset.y) + " " + Math.round(offset.z) + "<br>" + Math.round(offset.a) + " " + Math.round(offset.b) + " " + Math.round(offset.g);

			msg = "<br>动作: "

			// a面
			switch(true) {
				case offset.a > 10:
					msg += "左移";
					motion_callback.a = 1;
				break;
				case offset.a < -10:
					msg += "右移";
					motion_callback.a = 2;
				break;
				default:
					motion_callback.a = 0;
			}

			// b面
			switch(true) {
				case offset.b > 10:
					msg += "抬起";
					motion_callback.b = 1;
				break;
				case offset.b < -10:
					msg += "放下";
					motion_callback.b = 2;
				break;
				default:
					motion_callback.b = 0;

			}

			// g面
			switch(true) {
				// offset.a主要是用来防止平移时出现翻转判定
				case offset.g < -30 && offset.a > -15 && offset.b > -15:
					msg += "左翻";
					motion_callback.g = 1;
				break;
				case offset.g > 30 && offset.a < 15 && offset.b < 15:
					msg += "右翻";
					motion_callback.g = 2;
				break;
				default:
					motion_callback.g = 0;
			}

			// x轴
			switch(true) {
				case offset.x < -8:
					msg += "左甩";
					motion_callback.x = 1;
				break;
				case offset.x > 8:
					msg += "右甩";
					motion_callback.x = 2;
				break;
				default:
					motion_callback.x = 0;
			}

			// y轴
			switch(true) {
				case offset.y > 5:
					msg += "前甩";
					motion_callback.y = 1;
				break;
				case offset.y < -5:
					msg += "后甩";
					motion_callback.y = 2;
				break;
				default:
					motion_callback.y = 0;
			}

			// z轴
			switch(true) {
				case offset.z > 5:
					msg += "上甩";
					motion_callback.z = 1;
				break;
				case offset.z < -5:
					msg += "下甩";
					motion_callback.z = 2;
				break;
				default:
					motion_callback.z = 0;
			}


			last_time = cur_time;   

			last_gravity = gravity;
			last_coor = coor;  
		}
	}

	//重新设置初始陀螺仪状态
	Gyro.setOri = function() {
		ori = coor;
	}

	//获取初始陀螺仪状态
	Gyro.getOri = function() {
		// ori = coor;
		return ori;
	}

	//获取陀螺仪变化量
	Gyro.getOffsetOri = function() {
		return {
			a: coor.a - last_coor.a,
			b: coor.b - last_coor.b,
			g: coor.g - last_coor.g
		}
	}

	//获取加速计变化量
	Gyro.getOffsetGravity = function() {
		return {
			x: gravity.x - last_gravity.x,
			y: gravity.y - last_gravity.y,
			z: gravity.z - last_gravity.z
		}
	}

	//识别当前位置
	var getSpace = function() {
		if(range.call(coor.b, 60, 80)) {
			//用户把手机举起平视线
		}
		if(range.call(coor.b, 10, 60)) {
			//用户自然举起手机
		}
		if(range.call(coor.b, 0, 10)) {
			//用户手机置于桌面
		}
		if(range.call(coor.b, -20, 0)) {
			//用户手机下倾
		}
	}

	//实时响应
	var response = {
		//平移移动
		m1: function(node) {
			var left = config.ban == "x" ? 0 : (coor.a - ori.a) * page_scale_x + "px";
			var top = config.ban == "y" ? 0 : (coor.b - ori.b) * page_scale_y + "px";

			node.style['-webkit-transform'] = 'translate3d(' + left + ',' + top + ',0)';
			node.style['transform'] = 'translate3d(' + left + ',' + top + ',0)';
		},
		//翻转移动
		m2: function(node) {
			var left = config.ban == "x" ? 0 : (coor.g - ori.g) * page_scale_x + "px";
			var top = config.ban == "y" ? 0 :  (coor.b - ori.b) * page_scale_y + "px";

			node.style['-webkit-transform'] = 'translate3d(' + left + ',' + top + ',0)';
			node.style['transform'] = 'translate3d(' + left + ',' + top + ',0)';
		}
	}

	window.Gyro = Gyro;

}());