import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

import { CloudUploadOutlined, CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Switch,
  Upload,
  ConfigProvider
} from 'antd';

import './App.css';

const ValidatedItem = ({
  errors,
  children,
  ...props
}) => {

  return (
    <Form.Item {...props}>
      {children}
      {!!errors.length && (
        <ul className='errors'>
          {errors.map(e => <li key={e}>{e}</li>)}
        </ul>
      )}
    </Form.Item>
  )
}


const PositionForm = ({
  position,
  updatePosition,
  categories,
  canDelete,
  deletePosition,
  validate
}) => {
  categories = categories.map(c => ({label: c, value: c}));
  categories.push({label: "Другое", value: ""});

  const [checked, setChecked] = useState(position.warehouse)
  const [canDeleteSubitem, setCanDeleteSubitem] = useState(position.subitems.length > 1);
  const [grouped, setGrouped] = useState(position.type === 1);

  const update = useCallback(
    data => {
      updatePosition(position.id, data);
      console.log(data)
    }, [updatePosition, position.id]
  );

  const addSubitem = useCallback(() => {
    update({
      subitems: [
        ...position.subitems, 
        {id: Date.now(), title: "", titleErrors: [], warehouse: false, warehouseCount: "", warehouseCountErrors: []}
      ]
    })
  }, [update, position])

  const updateGrouped = useCallback((e) => {
    setGrouped(e.target.value === 1);
  }, [setGrouped])


  const deleteSubitem = useCallback(id => update({subitems: position.subitems.filter(s => s.id !== id)}), [update, position.subitems])


  useEffect(() => setCanDeleteSubitem(position.subitems.length > 1), [setCanDeleteSubitem, position.subitems])

  useEffect(() => {
    let subitems = []

    if (grouped && !!!subitems.length) {
      subitems = [{id: Date.now(), title: "", titleErrors: [], warehouse: false, warehouseCount: "", warehouseCountErrors: []}]
    }
    else if (!grouped) {
      subitems = []
    }
    update({type: grouped ? 1 : 0, subitems: subitems})
  }, [grouped, update])

  return (
    <Form
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 14 }}
      layout="horizontal"
      style={{ maxWidth: 600 }}
    >
      <ValidatedItem label="Название" required errors={position.titleErrors}>
        <Input status={!!position.titleErrors.length && 'error'} value={position.title} onChange={e => update({title: e.target.value})}/>
      </ValidatedItem>
      
      <ValidatedItem label="Изображение" valuePropName="fileList" required errors={position.imageErrors}>
        <Upload listType="picture" maxCount={1} accept='image/*' action='https://tmpfiles.org/api/v1/upload' onChange={({file}) => {update({image: file})}}>
          <Button icon={<CloudUploadOutlined />}>Загрузить</Button>
        </Upload>
      </ValidatedItem>
      {categories && (<Form.Item label="Категория">
        <Select 
          placeholder="Выберите категорию" 
          value={position.category}
          onSelect={v => update({category: v})}
          options={categories} />
      </Form.Item>)}
      <ValidatedItem label="Стоимость" required errors={position.priceErrors}>
        <InputNumber 
          status={!!position.priceErrors.length && 'error'} 
          precision={2} 
          value={position.price} 
          onChange={v => update({price: v})}
        />
      </ValidatedItem>
      <Form.Item label="Описание">
        <Input.TextArea rows={3} value={position.description} onChange={e => update({description: e.target.value})}/>
      </Form.Item>

      <Form.Item label="Склад">
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          checked={checked}
          onChange={e => {update({warehouse: e}); setChecked(e)}}
        />
        {checked && (
          <ValidatedItem errors={position.warehouseCountErrors} label="Количество товара на складе">
            <InputNumber 
              status={!!position.warehouseCountErrors.length && 'error'} 
              precision={0} 
              value={position.warehouseCount} 
              onChange={v => update({warehouseCount: v})}
            />
          </ValidatedItem>
        )}
      </Form.Item>
  
      <Form.Item label="Тип">
        <Radio.Group defaultValue={position.type} onChange={updateGrouped}>
          <Radio.Button value={0}>Простой</Radio.Button>
          <Radio.Button value={1}>Сгрупированный</Radio.Button>
        </Radio.Group>
      </Form.Item>

      {grouped && (
        <div className='subitems'>
          {position.subitems.map(s => {
            const updateSubitem = data => {
              update({
                subitems:  position.subitems.map(si => si.id === s.id ? {...si, ...data} : si)
              })
            }
            return (
              <div key={position.subitems.indexOf(s)}>
                <ValidatedItem 
                  errors={s.titleErrors} 
                  key={position.subitems.indexOf(s)} 
                  label={`Название подтовара #${position.subitems.indexOf(s) + 1}`}
                >
                  <Input status={!!s.titleErrors.length && 'error'} value={s.title} onChange={e => updateSubitem({title: e.target.value})}/>
                </ValidatedItem>
                <Form.Item label="Склад">
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    checked={s.warehouse}
                    onChange={e => {updateSubitem({warehouse: e})}}
                  />
                  {s.warehouse && (
                    <ValidatedItem errors={s.warehouseCountErrors} label="Количество подтовара на складе">
                      <InputNumber 
                        status={!!s.warehouseCountErrors.length && 'error'} 
                        precision={0} 
                        value={s.warehouseCount} 
                        onChange={v => updateSubitem({warehouseCount: v})}
                      />
                    </ValidatedItem>)}
                </Form.Item>
                {canDeleteSubitem && (
                  <Form.Item>
                  <Button 
                    danger 
                    onClick={() => deleteSubitem(s.id)}
                  >
                    <DeleteOutlined style={{color: '#ff4d4f !important', width: '100%', justifyContent: 'center'}}/>
                  </Button>
                </Form.Item>
      )}
              </div>
          )})}
          {!!position.subitems.length && (
            <Form.Item>
              <Button onClick={(addSubitem)}>Добавить подтовар</Button>
            </Form.Item>
          )}
        </div>
      )}
      {canDelete && (
        <Form.Item>
          <Button 
            danger 
            onClick={() => deletePosition(position.id)}
          >
            <DeleteOutlined style={{color: '#ff4d4f !important', width: '100%', justifyContent: 'center'}}/>
          </Button>
        </Form.Item>
      )}

    </Form>
  )

}

const App = ({tg, categories, bot_id, password, host, user_id, message_id}) => {
  const [loader, setLoader] = useState(false)

  const defaultPosition = useCallback(() => ({
    id: Date.now(),
    title: "",
    titleErrors: [],
    description: "",
    descriptionErrors: [],
    price: "",
    priceErrors: [],
    type: 0,
    image: null,
    imageErrors: [],
    subitems: [],
    category: "",
    warehouse: false,
    warehouseCount: "",
    warehouseCountErrors: [],
    isValid: true
  }), []);

  const [positions, setPositions] = useState([defaultPosition()])
  const [send, setSend] = useState(false);

  const addPosition = useCallback(() => setPositions([...positions, defaultPosition()]), [positions, setPositions, defaultPosition])

  const updatePosition = useCallback((id, data) => {
    setPositions(prevPositions =>
      prevPositions.map(obj => obj.id === id ? { ...obj, ...data } : obj)
    );
  }, [setPositions]);

  const validatePositions = useCallback(() => {
    const vPositions = positions.map(position => {
      const titleErrors = []
      const priceErrors = []
      const imageErrors = []
      const warehouseCountErrors = []
      const subitems = position.subitems;
      let isValid = true;
      
      if (!!!position.title) {
        titleErrors.push('Обязательное поле')
      }
      else if (position.title.length < 3) {
        titleErrors.push('Название должно содержать минимум 3 символа')
      }
  
      if (!!!position.price) {
        priceErrors.push('Обязательное поле')
      }
  
      if (position.warehouse && !!!position.warehouseCount) {
        warehouseCountErrors.push('Обязательное поле')
      }

      if (!!!position.image || position.image.status !== 'done') {
        imageErrors.push('Обязательное поле')
      }
  
      subitems.map(subitem => {
        subitem.titleErrors = []
        subitem.warehouseCountErrors = []
  
        if (!!!subitem.title) {
          subitem.titleErrors.push('Обязательное поле')
        }
        else if (subitem.title.length < 3) {
          subitem.titleErrors.push('Название должно содержать минимум 3 символа')
        }
  
        if (subitem.warehouse && !!!subitem.warehouseCount) {
          subitem.warehouseCountErrors.push('Обязательное поле')
        }
        return subitem
  
      });

      isValid = !!!titleErrors.length && 
                !!!warehouseCountErrors.length && 
                !!!priceErrors.length && 
                !!!imageErrors.length &&
                subitems.every(s => !!!s.titleErrors.length && !!!s.warehouseCountErrors.length)

      return {...position, titleErrors, priceErrors, imageErrors, warehouseCountErrors, subitems, isValid}
    })

    setPositions(vPositions)

    return vPositions;
  }, [positions, setPositions])

  const save = useCallback(() => {
    validatePositions()
    setSend(true)

  }, [validatePositions])

  const createPositions = useCallback(async (data) => {
    const payload = {data, password, bot_id: Number(bot_id), user_id: Number(user_id), message_id: Number(message_id)}
      setLoader(true)
      await axios.post(`${host}/positions`, payload, {headers: {'ngrok-skip-browser-warning': 1}}).then((response) => {
        if (response.status === 201) {
          tg.close();
          // setLoaded(true)
        }
        else if (response.status === 400) {
          console.log(response.data)
        }
      }).catch((err) => {
      }).finally(
        () => {
          setLoader(false)
        })
  }, [bot_id, host, password, tg, user_id, message_id])

  useEffect(() => {
      loader ? tg.MainButton.disable() : tg.MainButton.enable()
  }, [loader, tg])

  useEffect(() => {
    if (send && positions.every(p => p.isValid)) {
      console.log(send)
      console.log(positions)
      const data = positions.map(p => ({
          name: p.title, 
          price: p.price, 
          description: p.description,
          grouped: p.type === 1,
          image: p.image.response.data.url,
          warehouse: p.warehouse,
          warehouseCount: p.warehouseCount,
          subitems: p.subitems.map(s => ({
            name: s.title,
            warehouse: s.warehouse,
            warehouseCount: s.warehouseCount
          }))
        }))
      console.log(data)
      console.log(data.length)

      // tg.sendData(data)
      createPositions(data)
    }
    else {
      setSend(false)
    }
  }, [send, positions, tg, createPositions, bot_id, setSend])

  const deletePosition = useCallback(id => setPositions(prevPositions => prevPositions.filter(p => p.id !== id)), [setPositions])

  tg.MainButton.onClick(() => {
    tg.HapticFeedback.impactOccurred("medium");
    save();
  });

  return (
    <ConfigProvider
      theme={{
        hashed: false,
        components: {
          Button: {
            colorPrimary: "var(--tg-theme-bg-color)",
            fontFamily: 'Futura PT',
            algorithm: true, // Enable algorithm
          },
          Select: {
            colorPrimary: "var(--tg-theme-bg-color)",
            fontFamily: 'Futura PT',
            colorBgBase: "var(--tg-theme-secondary-bg-color)",
            colorIcon: "var(--tg-theme-button-color)",
            colorFill: "var(--tg-theme-secondary-bg-color)",
          },
          Radio: {
            fontFamily: 'Futura PT',
            colorBorderSecondary: 'var(--tg-theme-button-color)'
          },
          Input: {
            fontFamily: 'Futura PT',
            colorPrimary: 'var(--tg-theme-button-color)',
            algorithm: true, // Enable algorithm
          }
        },
      }}
    >
      <div className='form'>
        <div>
          {positions.map(p => (
              <PositionForm 
                key={positions.indexOf(p)} 
                canDelete={positions.length > 1} 
                deletePosition={deletePosition}
                position={p} 
                categories={categories} 
                updatePosition={updatePosition}
              />
            ))}
        </div>
        <Button onClick={(addPosition)} className='btn' size='large'>Добавить другой товар</Button>
        <Button size='large' onClick={save} disabled={loader}>Save</Button>
      </div>
    </ConfigProvider>
  )
}

export default App;
